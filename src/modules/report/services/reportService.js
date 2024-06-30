import reportModel from "../../../shared/models/reportModel.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";
import CONSTANTS from "../../../shared/utils/constansts.js";

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
};

export default reportService;
