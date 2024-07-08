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

    // 1. 현재 구독중인지 아닌지 셀렉트
    const selectedRows = await psqlConnect.query(
      subscriptionModel.select({ fromAccountIdx: accountIdx, toAccountIdx: toAccountIdx })
    );
    const isSubscribed = selectedRows.rows[0]?.isDeleted === true ? true : false;

    // 2-1. 현재 구독중이라면 구독 해제, 구독자수 -1 묶어서 트랜잭션
    if (isSubscribed) {
      await psqlConnect.transaction([
        subscriptionModel.update({ fromAccountIdx: accountIdx, toAccountIdx: toAccountIdx, status: false }),
        accountModel.updateSubscribeCnt({ accountIdx: toAccountIdx, isPlus: false }),
      ]);
    }
    // 2-2. 현재 구독중이 아니라면 upsert, 구독자수 +1 묶어서 트랜잭션
    else {
      await psqlConnect.transaction([
        subscriptionModel.insert({ fromAccountIdx: accountIdx, toAccountIdx: toAccountIdx }),
        accountModel.updateSubscribeCnt({ accountIdx: toAccountIdx, isPlus: true }),
      ]);
    }

    return;
  },
};

export default subscriptionService;
