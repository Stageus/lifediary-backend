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
import likeModel from "../../../shared/models/likeModel.js";

const diaryService = {
  getMainWithFirstData: async (req, res) => {
    const { page } = req.query;
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);
    // const ipAddress = Number(req.ip.split(".").join(""));
    const ipAddress = req.ip;

    const result = await psqlConnect.query(
      diaryModel.selectMainWithFirstRow({
        accountIdx: accountIdx,
        page: Number(page),
        diaryIdx: diaryIdx,
        ipAddress: ipAddress,
      })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getMain: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);
    // const ipAddress = Number(req.ip.split(".").join(""));
    const ipAddress = req.ip;

    const result = await psqlConnect.query(
      diaryModel.selectMain({ accountIdx: accountIdx, page: Number(page), ipAddress: ipAddress })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getSearch: async (req, res) => {
    const { page } = req.query;
    const tags = typeof req.query.tags === "string" ? JSON.parse(req.query.tags) : req.query.tags;
    const { accountIdx } = jwt.verify(req.headers.token);
    // const ipAddress = Number(req.ip.split(".").join(""));
    const ipAddress = req.ip;

    const result = await psqlConnect.query(
      diaryModel.selectSearch({ accountIdx: accountIdx, page: Number(page), ipAddress: ipAddress, tags: tags })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getHome: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);
    // const ipAddress = Number(req.ip.split(".").join(""));
    const ipAddress = req.ip;

    const result = await psqlConnect.query(
      diaryModel.selectHome({ accountIdx: accountIdx, page: Number(page), ipAddress: ipAddress })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  post: async (req, res) => {
    const { textContent, color, isPublic } = req.body;
    const tags = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags || [];
    const imgContents = fileFormat(req.files);
    const { accountIdx } = jwt.verify(req.headers.token);

    let poolClient;
    try {
      poolClient = await new pg.Pool(psqlConfig).connect();
      await poolClient.query("BEGIN");

      // insert
      const insertDiaryQuery = diaryModel.insert({
        textContent,
        imgContents: imgContents.map((img) => img.fileName),
        tags,
        color,
        isPublic,
        accountIdx,
      });
      const {
        rows: [{ idx: diaryIdx }],
      } = await poolClient.query(insertDiaryQuery.sql, insertDiaryQuery.values);

      // insert
      // psql
      const insertQueries = [
        noticeModel.insert({
          fromAccountIdx: accountIdx,
          diaryIdx,
          noticeType: CONSTANTS.NOTICE_TYPE.NEW_DIARY,
        }),
        tagModel.insert({ diaryIdx, tags }),
        accountModel.updateDiaryCnt({ accountIdx, isPlus: true }),
      ];

      await Promise.all(insertQueries.map((query) => poolClient.query(query.sql, query.values)));

      // bucket
      const bucketOperations =
        imgContents.length > 0
          ? [
              bucketModel.insertMany({
                imgContents,
                bucketFolderPath: path.join(accountIdx.toString(), diaryIdx.toString()),
              }),
            ]
          : [];

      await Promise.all(bucketOperations);

      await poolClient.query("COMMIT");
    } catch (err) {
      await poolClient.query("ROLLBACK");
      if (err.status) {
        sendError({ message: err.message, status: err.status, stack: err.stack });
      } else {
        sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
      }
    } finally {
      if (poolClient) poolClient.release();
    }

    return;
  },
  put: async (req, res) => {
    const { textContent, isPublic, color } = req.body;
    const tags = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags || [];
    const { diaryIdx } = req.params;
    const imgContents = fileFormat(req.files);
    const { accountIdx } = jwt.verify(req.headers.token);
    const deletedImgs =
      typeof req.body.deletedImgs === "string" ? JSON.parse(req.body.deletedImgs) : req.body.deletedImgs || [];

    const deletedImgInfo = deletedImgs.map((url) => {
      const pathname = new URL(url).pathname;
      return {
        filePath: pathname.substring(1),
        fileName: pathname.substring(pathname.lastIndexOf("/") + 1),
      };
    });

    let poolClient;
    try {
      poolClient = await new pg.Pool(psqlConfig).connect();
      await poolClient.query("BEGIN");

      // check
      const checkQuery = diaryModel.selectAccountIdx({ diaryIdx: diaryIdx });
      const check = await poolClient.query(checkQuery.sql, checkQuery.values);

      if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });
      if (check.rows[0].accountIdx !== accountIdx) sendError({ status: 403, message: CONSTANTS.MSG[403] });

      // update
      // psql
      const updateQueries = [
        diaryModel.update({
          textContent,
          imgContents: imgContents.map((img) => img.fileName),
          tags,
          color,
          isPublic,
          accountIdx,
          deletedImgs: deletedImgInfo.map((img) => img.fileName),
          diaryIdx,
        }),
        tagModel.update({ diaryIdx, tags }),
      ];

      await Promise.all(updateQueries.map((query) => poolClient.query(query.sql, query.values)));

      // bucket
      const bucketOperations = [];
      if (imgContents.length > 0) {
        bucketOperations.push(
          bucketModel.insertMany({
            imgContents,
            bucketFolderPath: path.join(accountIdx.toString(), diaryIdx.toString()),
          })
        );
      }

      if (deletedImgInfo.length > 0) {
        bucketOperations.push(bucketModel.deleteMany({ deletedBucketImgs: deletedImgInfo.map((img) => img.filePath) }));
      }

      await Promise.all(bucketOperations);

      await poolClient.query("COMMIT");
    } catch (err) {
      await poolClient.query("ROLLBACK");
      if (err.status) {
        sendError({ message: err.message, status: err.status, stack: err.stack });
      } else {
        sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
      }
    } finally {
      if (poolClient) poolClient.release();
    }

    return;
  },
  delete: async (req, res) => {
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(diaryModel.selectAccountIdx({ diaryIdx: diaryIdx }));

    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx) sendError({ status: 403, message: CONSTANTS.MSG[403] });

    await psqlConnect.transaction([
      diaryModel.delete({ diaryIdx }),
      accountModel.updateDiaryCnt({ accountIdx: accountIdx, isPlus: false }),
    ]);

    return;
  },
  postLike: async (req, res) => {
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(diaryModel.selectAccountIdx({ diaryIdx: diaryIdx }));
    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    const queries = [];
    const selectedRows = await psqlConnect.query(likeModel.select({ accountIdx: accountIdx, diaryIdx: diaryIdx }));
    const isLiked = !selectedRows.rows[0]?.isDeleted;

    if (!isLiked) {
      queries.push(diaryModel.updateLikeCnt({ diaryIdx: diaryIdx, isPlus: true }));
      queries.push(likeModel.updateIsDeleted({ accountIdx: accountIdx, diaryIdx: diaryIdx, status: false }));
    } else if (isLiked) {
      queries.push(diaryModel.updateLikeCnt({ diaryIdx: diaryIdx, isPlus: false }));
      queries.push(likeModel.insertWithUpdate({ accountIdx: accountIdx, diaryIdx: diaryIdx }));
    }

    await psqlConnect.transaction(queries);
    return;
  },
};

export default diaryService;
