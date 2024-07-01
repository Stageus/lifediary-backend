import bucketModel from "../../../shared/models/bucketModel.js";
import diaryModel from "../../../shared/models/diaryModel.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";
import path from "path";
import pg from "pg";
import psqlConfig from "../../../shared/configs/psqlConfig.js";
import noticeModel from "../../../shared/models/noticeModel.js";
import tagModel from "../../../shared/models/tagModel.js";
import fileFormat from "../../../shared/utils/fileFormat.js";
import accountModel from "../../../shared/models/accountModel.js";

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
    const { page } = req.query;
    const tags = typeof req.query.tags === "string" ? JSON.parse(req.query.tags) : req.query.tags;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(
      diaryModel.selectSearch({ accountIdx: accountIdx, page: Number(page), ipAddress: req.ip, tags: tags })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getHome: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(
      diaryModel.selectHome({ accountIdx: accountIdx, page: Number(page), ipAddress: req.ip })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  post: async (req, res) => {
    const { textContent, color, isPublic } = req.body;
    const tags = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags;
    const imgContents = fileFormat(req.files);
    const { accountIdx } = jwt.verify(req.headers.token);

    let poolClient;
    try {
      poolClient = await new pg.Pool(psqlConfig).connect();
      await poolClient.query("BEGIN");

      // first
      const firstQuery = diaryModel.insert({
        textContent,
        imgContents: imgContents.map((img) => img.fileName),
        tags,
        color,
        isPublic,
        accountIdx,
      });
      const {
        rows: [{ idx: diaryIdx }],
      } = await poolClient.query(firstQuery.sql, firstQuery.values);

      // second
      await Promise.all([
        // s3
        bucketModel.insertMany({
          imgContents: imgContents,
          bucketFolderPath: path.join(accountIdx.toString(), diaryIdx.toString()),
        }),
        // psql
        [
          noticeModel.insert({
            fromAccountIdx: accountIdx,
            diaryIdx: diaryIdx,
            noticeType: CONSTANTS.NOTICE_TYPE.NEW_DIARY,
          }),
          tagModel.insert({ diaryIdx: diaryIdx, tags: tags }),
          accountModel.updateDiaryCnt({ accountIdx: accountIdx, isPlus: true }),
        ].map((query) => poolClient.query(query.sql, query.values)),
      ]);

      await poolClient.query("COMMIT");
    } catch (err) {
      await poolClient.query("ROLLBACK");
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    } finally {
      if (poolClient) poolClient.release();
    }

    return;
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
