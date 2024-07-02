import reportModel from "../../../shared/models/reportModel.js";
import diaryModel from "../../../shared/models/diaryModel.js";
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

  getCnt: async (req, res) => {
    const selectedRows = await psqlConnect.query(reportModel.selectCnt());
    const result = selectedRows.rows[0].count;

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
    console.log(req.body);

    return { result: req.body };
  },
};

export default reportService;
