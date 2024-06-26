import jwt from "../../../shared/utils/jwt.js";
import subscriptionModel from "../../../shared/models/subscriptionModel.js";
import accountModel from "../../../shared/models/accountModel.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";

const subscriptionService = {
  get: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const selectedRows = await psqlConnect.query(
      subscriptionModel.selectList({ fromAccountIdx: accountIdx, page: page })
    );

    if (selectedRows.rowCount == 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    const result = selectedRows.rows;

    return result;
  },

  post: async (req, res) => {
    const { toAccountIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    if (toAccountIdx == accountIdx) {
      sendError({ status: 409, message: CONSTANTS.MSG[409] });
    }

    const check = await psqlConnect.query(accountModel.selectFromIdx({ accountIdx: toAccountIdx }));
    if (check.rowCount === 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    await psqlConnect.query(subscriptionModel.insert({ fromAccountIdx: accountIdx, toAccountIdx: toAccountIdx }));

    return;
  },
};

export default subscriptionService;
