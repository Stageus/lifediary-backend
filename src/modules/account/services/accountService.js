import axios from "axios";
import accountModel from "../../../shared/models/accountModel.js";
import subscriptionModel from "../../../shared/models/subscriptionModel.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";

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

    const googleToken = await axios.post(process.env.GOOGLE_TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const googleAccountInfo = await axios.get(process.env.GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${googleToken.data.access_token}`,
      },
    });

    let result = {};
    const selectedRows = await psqlConnect.query(
      accountModel.selectFromGoogleId({ oauthGoogleId: googleAccountInfo.data.id })
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
        googleName: googleAccountInfo.data.name,
        googleProfileImg: googleAccountInfo.data.picture,
        isAccountExist: false,
      };
    }

    return result;
  },


  get: async (req, res) => {
    const { idx: accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    const selectedRows = await psqlConnect.query(accountModel.selectFromIdx({ accountIdx: accountIdx }));
    const result = selectedRows.rows[0];

    return result;
  },

  post: async (req, res) => {
    const { profileImg, nickname, oauthGoogleId } = req.body;

    const insertedRows = await psqlConnect.query(
      accountModel.insert({ oauthGoogleId: oauthGoogleId, nickname: nickname, profileImg: profileImg })
    );
    const account = insertedRows.rows[0];

    const token = jwt.sign({
      profileImg: account.profileImg,
      accountIdx: account.idx,
      permission: account.permission,
    });

    return { token: token };
  },

  putNickname: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }
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


    const result = { duplication: false };
    if (nicknameAccount && nicknameAccount.idx !== accountIdx) {
      result.duplication = true;
    }

    return result;
  },

  putProfileImg: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    const { profileImg } = req.body;

    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    await psqlConnect.query(accountModel.updateProfileImg({ profileImg: profileImg, accountIdx: accountIdx }));

    return;
  },

  delete: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    await psqlConnect.query(accountModel.delete({ accountIdx: accountIdx }));

    return;
  },

  getOtherAccount: async (req, res) => {
    const { accountidx: otherAccountIdx } = req.params;
    const selectedRowsFromAccount = await psqlConnect.query(
      accountModel.selectFromIdx({ accountIdx: otherAccountIdx })
    );
    let result = selectedRowsFromAccount.rows[0];
    result.isSubscribed = false;

    if (jwt.verify(req.headers.token)) {
      const { accountIdx } = jwt.verify(req.headers.token);
      const selectedRowsFromSubscription = await psqlConnect.query(
        subscriptionModel.select({ fromAccountIdx: accountIdx, toAccountIdx: otherAccountIdx })
      );
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
