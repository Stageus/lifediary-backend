import axios from "axios";
import accountModel from "../models/accountModel.js";
import jwtSign from "../utils/jwtSign.js";

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
    const account = accountModel.selectFromGoogleId({
      id: googleAccountInfo.data.id,
    });

    if (account) {
      const token = jwtSign({
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
  insertAccount: () => {},
  selectAccount: () => {},
  update: () => {},
  delete: () => {},
};

export default accountService;
