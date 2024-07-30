import axios from "axios";
import accountModel from "../../../shared/models/accountModel.js";
import subscriptionModel from "../../../shared/models/subscriptionModel.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import fileFormat from "../../../shared/utils/fileFormat.js";
import pg from "pg";
import psqlConfig from "../../../shared/configs/psqlConfig.js";
import bucketModel from "../../../shared/models/bucketModel.js";
import path from "path";

const accountService = {
  oauthGoogle: (req, res) => {
    let url = "https://accounts.google.com/o/oauth2/v2/auth";
    url += `?client_id=${process.env.GOOGLE_ID}`;
    url += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
    url += "&response_type=code";
    url += "&scope=email profile";

    return { redirectUrl: url };
  },

  oauthGoogleRedirect: async (req, res) => {
    const { code } = req.query;

    const tokenResponse = await fetch(process.env.GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_ID,
        client_secret: process.env.GOOGLE_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch Google token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Google 사용자 정보 요청
    const userInfoResponse = await fetch(process.env.GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const googleAccountInfo = await userInfoResponse.json();

    let result = {};
    const selectedRows = await psqlConnect.query(
      accountModel.selectFromGoogleId({
        oauthGoogleId: googleAccountInfo.id,
      })
    );

    const account = selectedRows.rows[0];

    if (account) {
      const token = jwt.sign({
        profileImg: account.profileImg,
        accountIdx: account.idx,
        permission: account.permission,
      });

      result = { token: token, isAccountExist: true };
    } else {
      result = {
        oauthGoogleId: googleAccountInfo.data.id,
        googleName: googleAccountInfo.data.name,
        googleProfileImg: googleAccountInfo.data.picture,
        isAccountExist: false,
      };
    }

    return result;
  },

  get: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);

    const selectedRows = await psqlConnect.query(accountModel.selectFromIdx({ accountIdx: accountIdx }));
    const result = selectedRows.rows[0];

    return result;
  },

  post: async (req, res) => {
    const { nickname, oauthGoogleId } = req.body;
    const profileImg = fileFormat(req.files)[0];

    let poolClient;
    let insertedAccount = undefined;

    try {
      poolClient = await new pg.Pool(psqlConfig).connect();
      await poolClient.query("BEGIN");

      const insertedRows = await psqlConnect.query(
        accountModel.insert({ oauthGoogleId: oauthGoogleId, nickname: nickname, profileImg: profileImg.fileName })
      );

      insertedAccount = insertedRows.rows[0];

      await bucketModel.insertOne({
        imgContent: profileImg,
        bucketFolderPath: path.join(insertedAccount.idx.toString(), `profileImg`),
      });

      await poolClient.query("COMMIT");
    } catch (err) {
      await poolClient.query("ROLLBACK");
      if (err.status) {
        sendError({ message: err.message, status: err.status, stack: err.stack });
      } else {
        sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
      }
    } finally {
      if (poolClient) poolClient.release();
    }

    if (insertedAccount) {
      const token = jwt.sign({
        profileImg: insertedAccount.profileImg,
        accountIdx: insertedAccount.idx,
        permission: insertedAccount.permission,
      });

      return { token: token };
    }

    return;
  },

  putNickname: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    const { nickname } = req.body;

    const selectedRows = await psqlConnect.query(accountModel.selectNickname({ nickname: nickname }));
    const nicknameAccount = selectedRows.rows[0];

    if (nicknameAccount && nicknameAccount.idx !== accountIdx) {
      sendError({ status: 409, message: CONSTANTS.MSG[409] });
    }

    await psqlConnect.query(accountModel.updateNickname({ nickname: nickname, accountIdx: accountIdx }));

    return;
  },

  getNicknameDuplication: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);

    const { nickname } = req.body;

    const selectedRows = await psqlConnect.query(accountModel.selectNickname({ nickname: nickname }));
    const nicknameAccount = selectedRows.rows[0];

    const result = { isInvalid: false };
    if (nicknameAccount && nicknameAccount.idx !== accountIdx) {
      result.isInvalid = true;
    }

    return result;
  },

  putProfileImg: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    const profileImg = fileFormat(req.files)[0];

    const selectedRows = await psqlConnect.query(accountModel.selectFromIdx({ accountIdx: accountIdx }));
    const oldProfileImg = selectedRows.rows[0].profileImg;

    const bucketOperations = [];

    // 1. s3에 기존 이미지 삭제
    bucketOperations.push(bucketModel.deleteOne({ deletedBucketImgUrl: `${accountIdx}/profileImg/${oldProfileImg}` }));

    // 2. s3에 새로 이미지 업로드
    bucketOperations.push(
      bucketModel.insertOne({
        imgContent: profileImg,
        bucketFolderPath: path.join(accountIdx.toString(), `profileImg`),
      })
    );

    // 3. 1과 2를 프로미스로 묶음
    await Promise.all(bucketOperations);

    // 4. accountModel에 수정
    await psqlConnect.query(accountModel.updateProfileImg({ profileImg: profileImg.fileName, accountIdx: accountIdx }));

    return;
  },

  delete: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);

    await psqlConnect.query(accountModel.delete({ accountIdx: accountIdx }));

    return;
  },

  getOtherAccount: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    const { accountIdx: otherAccountIdx } = req.params;

    if (jwt.verify(req.headers.token) && accountIdx == otherAccountIdx) {
      sendError({ status: 400, message: CONSTANTS.MSG[400] });
    }

    const selectedRowsFromAccount = await psqlConnect.query(
      accountModel.selectFromIdx({ accountIdx: otherAccountIdx })
    );

    let result = selectedRowsFromAccount.rows[0];
    result.isSubscribed = false;

    // 접속한 사용자가 회원일경우 자신이 구독중인지 아닌지 여부도 표시
    if (jwt.verify(req.headers.token)) {
      const { accountIdx } = jwt.verify(req.headers.token);
      const selectedRowsFromSubscription = await psqlConnect.query(
        subscriptionModel.select({ fromAccountIdx: accountIdx, toAccountIdx: otherAccountIdx })
      );

      // subscription 테이블은 soft-delete로 구현되어 있음 (처음엔 insert -> 이후 update)
      // 따라서 subscription 테이블에 row가 있어도 isDeleted의 boolean값을 확인해야 함
      if (selectedRowsFromSubscription.rows[0]) {
        const isDeleted = selectedRowsFromSubscription.rows[0].isDeleted;
        if (isDeleted === false) {
          result.isSubscribed = true;
        }
      }
    }

    return result;
  },
};

export default accountService;
