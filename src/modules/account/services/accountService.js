import axios from "axios";
<<<<<<< HEAD:src/modules/account/services/accountService.js
import accountModel from "../../../shared/models/accountModel.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
=======
import accountModel from "../models/accountModel.js";
import jwtSign from "../utils/jwt.js";
import jwtVerify from "../utils/jwtVerify.js";
import CONSTANTS from "../utils/constansts.js";
import sendError from "../utils/sendError.js";
>>>>>>> 6511308 (feat: Update nickname 구현):src/services/accountService.js

const accountService = {
  getTokenInfo: (req, res) => {
    const result = jwtVerify(req.headers.token);

    if (!result) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    return result;
  },

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
<<<<<<< HEAD:src/modules/account/services/accountService.js
    const account = await psqlConnect.query(
      accountModel.selectFromGoogleId({ oauthGoogleId: googleAccountInfo.data.id })
    );
=======
    const account = await accountModel
      .selectFromGoogleId({
        id: googleAccountInfo.data.id,
      })
      .catch(() =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );
>>>>>>> 6511308 (feat: Update nickname 구현):src/services/accountService.js

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
    const { idx } = jwtVerify(req.headers.token);

<<<<<<< HEAD:src/modules/account/services/accountService.js
    const account = await accountModel.selectFromIdx({ idx: idx });

    return account;
  },
  insertAccount: () => {},
=======
    if (!idx) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    const account = await accountModel.selectMe({ idx: idx }).catch(() =>
      sendError({
        status: 500,
        message: CONSTANTS.MSG[500],
        stack: err.stack,
      })
    );

    return account;
  },

  insertAccount: async (req, res) => {
    const { profileImg, nickname, oauthGoogleId } = req.body;

    const account = await accountModel
      .insert({
        oauthGoogleId: oauthGoogleId,
        profileImg: profileImg,
        nickname: nickname,
      })
      .catch(() =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    const token = jwtSign({
      profileImg: account.profileImg,
      idx: account.idx,
      permission: account.permission,
    });

    return { token: token };
  },
  updateNickname: async (req, res) => {
    const { idx } = jwtVerify(req.headers.token);

    if (!idx) {
      sendError({ status: 401, message: CONSTANTS.MSG[404] });
    }
    const { nickname } = req.body;

    const updateAccount = await accountModel.updateNickname({
      idx: idx,
      nickname: nickname,
    });
    if (updateAccount.rowCount === 0) {
      sendError({ status: 409, message: CONSTANTS.MSG[409] });
    }
    return;
  },
>>>>>>> 6511308 (feat: Update nickname 구현):src/services/accountService.js
  selectAccount: () => {},
  update: () => {},
  delete: () => {},
};

export default accountService;
