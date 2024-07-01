import diaryModel from "../../../shared/models/diaryModel.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import seedCTE from "../../../shared/utils/seedCTE.js";
import sendError from "../../../shared/utils/sendError.js";

const diaryService = {
  getMainWithFirstData: async (req, res) => {
    const { page } = req.query;
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(
      diaryModel.selectMainWithFirstRow({
        accountIdx: accountIdx,
        page: Number(page),
        diaryIdx: diaryIdx,
        ipAddress: req.ip,
      })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getMain: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(
      diaryModel.selectMain({ accountIdx: accountIdx, page: Number(page), ipAddress: req.ip })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getSearch: async (req, res) => {
    const { page, tags } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(
      diaryModel.selectSearch({ accountIdx: accountIdx, page: Number(page), ipAddress: req.ip, tags: JSON.parse(tags) })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getHome: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    // selectHome

    // 404

    return result.rows;
  },
  post: async (req, res) => {
    const { imgContents, textContents, tags, isPublic, color } = req.body;
    const { accountIdx } = jwt.verify(req.headers.token);

    // insert
    // noticeInsert
    // tagInsert
    // accountDiaryCnt update

    return result.rows;
  },
  put: async (req, res) => {
    const { imgContents, deletedImgs, textContents, tags, isPublic, color } = req.body;
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    // update
    // tagUpdate

    // 404

    // 403

    return result.rows;
  },
  delete: async (req, res) => {
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    // update
    // tagDelete
    // accountDiaryCnt update

    // 404

    // 403

    return result.rows;
  },
};

export default diaryService;
