import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import accountModel from "../../../shared/models/accountModel.js";

const authService = {
  getTokenInfo: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);

    const selectedRows = await psqlConnect.query(accountModel.selectForAuth({ accountIdx: accountIdx }));
    const result = selectedRows.rows[0];

    return result;
  },
};

export default authService;
