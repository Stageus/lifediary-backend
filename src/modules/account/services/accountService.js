import axios from "axios";
import accountModel from "../../../shared/models/accountModel.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";

const accountService = {
  getRedirectUrl: (req, res) => {
    let url = "https://accounts.google.com/o/oauth2/v2/auth";
    url += `?client_id=${process.env.GOOGLE_ID}`;
    url += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
    url += "&response_type=code";
    url += "&scope=email profile";

    return { redirectUrl: url };
  },

  selectOauthGoogleId: async (req, res) => {
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
        idx: account.idx,
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

  selectIdx: async (req, res) => {
    const { idx: accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    const selectedRows = await psqlConnect.query(accountModel.selectFromIdx({ accountIdx: accountIdx }));
    const account = selectedRows.rows[0];

    return account;
  },
  insertAccount: async (req, res) => {
    const { profileImg, nickname, oauthGoogleId } = req.body;

    const insertedRows = await psqlConnect.query(
      accountModel.insert({ oauthGoogleId: oauthGoogleId, nickname: nickname, profileImg: profileImg })
    );
    const account = insertedRows.rows[0];

    const token = jwt.sign({
      profileImg: account.profileImg,
      idx: account.idx,
      permission: account.permission,
    });

    return { token: token };
  },
  updateNickname: async (req, res) => {
    const { idx: accountIdx } = jwt.verify(req.headers.token);
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
  selectNickname: async (req, res) => {
    const { idx: accountIdx } = jwt.verify(req.headers.token);
    const { nickname } = req.body;

    const selectedRows = await psqlConnect.query(accountModel.selectNickname({ nickname: nickname }));
    const nicknameAccount = selectedRows.rows[0];

    if (nicknameAccount && nicknameAccount.idx !== accountIdx) {
      sendError({ status: 409, message: CONSTANTS.MSG[409] });
    }

    return;
  },
  updateProfileImg: async (req, res) => {
    const { idx: accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    await psqlConnect.query(accountModel.updateProfileImg({ profileImg: profileImg, accountIdx: accountIdx }));

    return;
  },
  selectAccount: () => {},
  delete: async (req, res) => {
    const { idx: accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    await psqlConnect.query(accountModel.delete({ accountIdx: accountIdx }));

    return;
  },
};

export default accountService;
