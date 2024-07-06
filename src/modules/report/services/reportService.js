import reportModel from "../../../shared/models/reportModel.js";
import diaryModel from "../../../shared/models/diaryModel.js";
import noticeModel from "../../../shared/models/noticeModel.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import jwt from "../../../shared/utils/jwt.js";

const reportService = {
  get: async (req, res) => {
    const { page } = req.query;

    const selectedRows = await psqlConnect.query(reportModel.selectList({ page: page }));

    if (selectedRows.rowCount == 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    const result = selectedRows.rows;

    return result;
  },

  getNew: async (req, res) => {
    const selectedRows = await psqlConnect.query(reportModel.selectNew());
    const newRow = selectedRows.rows[0];

    if (newRow) {
      return { isNew: true };
    }

    return { isNew: false };
  },

  post: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    const { diaryIdx } = req.query;
    const { textContent } = req.body;

    const check = await psqlConnect.query(diaryModel.selectAccountIdx({ diaryIdx: diaryIdx }));

    if (check.rowCount === 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    await psqlConnect.query(
      reportModel.insert({ accountIdx: accountIdx, diaryIdx: diaryIdx, textContent: textContent })
    );

    return;
  },

  putStatus: async (req, res) => {
    const { accountIdx } = jwt.verify(req.headers.token);
    const { reportIdx } = req.params;
    const { isInvalid } = req.body;

    const check = await psqlConnect.query(reportModel.selectIdx({ reportIdx: reportIdx }));
    if (check.rowCount === 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    if (isInvalid === false) {
      await psqlConnect.query(reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }));
    } //
    else if (isInvalid === true) {
      const diaryIdx = check.rows[0].diaryIdx;

      const queries = [
        reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }),
        diaryModel.delete({ diaryIdx: diaryIdx }),
        noticeModel.insert({
          fromAccountIdx: accountIdx,
          toAccountIdx: check.rows[0].accountIdx,
          diaryIdx: diaryIdx,
          noticeType: CONSTANTS.NOTICE_TYPE.DELETED_DIARY,
        }),
        noticeModel.insert({
          fromAccountIdx: accountIdx,
          diaryIdx: diaryIdx,
          noticeType: CONSTANTS.NOTICE_TYPE.DELETED_MY_DIARY,
        }),
      ];

      await psqlConnect.transaction(queries);
    } //
    else if (isInvalid === null) {
      const prevStatus = check.rows[0].isInvalid;

      if (prevStatus === false) {
        await psqlConnect.query(reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }));
      }

      if (prevStatus === true) {
        const diaryIdx = check.rows[0].diaryIdx;

        const queries = [
          reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }),
          diaryModel.restore({ diaryIdx: check.rows[0].diaryIdx }),
          noticeModel.insert({
            fromAccountIdx: accountIdx,
            diaryIdx: diaryIdx,
            noticeType: CONSTANTS.NOTICE_TYPE.RECOVERED_DIARY,
          }),
        ];

        await psqlConnect.transaction(queries);
      }
    }

    return;
  },
};

export default reportService;
