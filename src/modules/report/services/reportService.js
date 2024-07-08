import accountModel from "../../../shared/models/accountModel.js";
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
    const reportCnt = (await psqlConnect.query(reportModel.selectCnt())).rows[0].maxPage;

    if (selectedRows.rowCount == 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }

    const result = { reports: selectedRows.rows, reportCnt: reportCnt };

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
    const diaryIdx = check.rows[0].diaryIdx;

    const selectedRows = await psqlConnect.query(diaryModel.selectAccountIdx({ diaryIdx: diaryIdx }));
    const diaryWriterIdx = selectedRows.rows[0].accountIdx;

    // isInvalid의 값은 true, false, null 3가지
    // false일경우 신고의 처리결과만 수정
    if (isInvalid === false) {
      await psqlConnect.query(reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }));
    }

    // true일 경우 일기를 삭제해야 하므로 신고의 처리결과 수정, 일기 삭제, 작성자 일기 개수 수정, 신고자와 일기작성자에게 알림 전송
    else if (isInvalid === true) {
      const queries = [
        reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }),
        diaryModel.delete({ diaryIdx: diaryIdx }),
        accountModel.updateDiaryCnt({ accountIdx: diaryWriterIdx, isPlus: false }),
        // 신고자에게 알림 전송
        noticeModel.insert({
          fromAccountIdx: accountIdx,
          toAccountIdx: check.rows[0].accountIdx,
          diaryIdx: diaryIdx,
          noticeType: CONSTANTS.NOTICE_TYPE.DELETED_DIARY,
        }),
        // 일기 작성자에게 알림 전송
        noticeModel.insert({
          fromAccountIdx: accountIdx,
          diaryIdx: diaryIdx,
          noticeType: CONSTANTS.NOTICE_TYPE.DELETED_MY_DIARY,
        }),
      ];

      await psqlConnect.transaction(queries);
    }

    // null일 경우 이전의 처리결과에 따라 다르게 처리
    else if (isInvalid === null) {
      const prevIsInvalid = check.rows[0].isInvalid;

      // 이전의 처리결과가 false였을 경우 처리결과만 수정
      if (prevIsInvalid === false) {
        await psqlConnect.query(reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }));
      }

      // 이전의 처리결과가 true였을 경우 처리결과 수정, 삭제된 일기 복구, 작성자 일기 개수 수정, 일기 작성자에게 알림 전송
      if (prevIsInvalid === true) {
        const queries = [
          reportModel.update({ reportIdx: reportIdx, isInvalid: isInvalid }),
          diaryModel.restore({ diaryIdx: check.rows[0].diaryIdx }),
          accountModel.updateDiaryCnt({ accountIdx: diaryWriterIdx, isPlus: true }),
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
