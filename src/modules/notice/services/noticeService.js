import noticeModel from "../../../shared/models/noticeModel.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";

const noticeService = {
  selectNotices: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(noticeModel.selectNotices({ toAccountIdx: accountIdx, page: page }));

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    await psqlConnect.query(noticeModel.updateRead({ toAccountIdx: accountIdx }));

    return result.rows;
  },
  selectIsNew: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(noticeModel.selectIsNew({ toAccountIdx: accountIdx }));

    return result.rows[0];
  },
  delete: async (req, res) => {
    const { noticeIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(noticeModel.select({ noticeIdx: noticeIdx }));

    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].toAccountIdx !== accountIdx) sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await psqlConnect.query(noticeModel.delete({ noticeIdx: noticeIdx, toAccountIdx: accountIdx }));

    return result.rows;
  },
};

export default noticeService;
