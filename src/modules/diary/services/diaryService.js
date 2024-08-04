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

    console.log(page, accountIdx, ipAddress);

    const result = await psqlConnect.query(
      diaryModel.selectMain({ accountIdx: accountIdx, page: Number(page), ipAddress: ipAddress })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  getSearch: async (req, res) => {
    const { page } = req.query;
    const tags = typeof req.query.tags === "string" ? [req.query.tags] : req.query.tags;
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
    const tags = typeof req.body.tags === "string" ? [req.body.tags] : req.body.tags || [];
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
    const tags = typeof req.body.tags === "string" ? [req.body.tags] : req.body.tags || [];
    const { diaryIdx } = req.params;
    const imgContents = fileFormat(req.files);
    const { accountIdx } = jwt.verify(req.headers.token);
    const deletedImgs = typeof req.body.deletedImgs === "string" ? [req.body.deletedImgs] : req.body.deletedImgs || [];

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
  getUserpage: async (req, res) => {
    const { page, beginDate, endDate } = req.query;
    const { accountIdx } = req.params;

    const selectedRows = await psqlConnect.query(
      diaryModel.selectFromAccount({ accountIdx: accountIdx, page: page, otherAccount: true, beginDate, endDate })
    );
    if (selectedRows.rowCount === 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }
    const result = selectedRows.rows;

    return result;
  },
  postLike: async (req, res) => {
    const { diaryIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(diaryModel.selectAccountIdx({ diaryIdx: diaryIdx }));
    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    const queries = [];
    const selectedRows = await psqlConnect.query(likeModel.select({ accountIdx: accountIdx, diaryIdx: diaryIdx }));
    const isLiked = selectedRows.rows[0] && selectedRows.rows[0].isDeleted === false ? true : false;

    if (isLiked) {
      // 현재 좋아요가 눌린 상태 -> 좋아요 해제 상태로 바꿔야 함
      queries.push(diaryModel.updateLikeCnt({ diaryIdx: diaryIdx, isPlus: false }));
      queries.push(likeModel.updateIsDeleted({ accountIdx: accountIdx, diaryIdx: diaryIdx, status: true }));
    } else if (!isLiked) {
      // 현재 좋아요가 눌리지 않은 상태 -> 좋아요 상태로 바꿔야 함
      queries.push(diaryModel.updateLikeCnt({ diaryIdx: diaryIdx, isPlus: true }));
      queries.push(likeModel.insertWithUpdate({ accountIdx: accountIdx, diaryIdx: diaryIdx, status: false }));
    }

    await psqlConnect.transaction(queries);
    return;
  },
  getMypageMine: async (req, res) => {
    const { page, beginDate, endDate } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const selectedRows = await psqlConnect.query(
      diaryModel.selectFromAccount({ accountIdx: accountIdx, page: page, otherAccount: false, beginDate, endDate })
    );
    if (selectedRows.rowCount === 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }
    const result = selectedRows.rows;

    return result;
  },
  getMypageLike: async (req, res) => {
    const { page } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const selectedRows = await psqlConnect.query(likeModel.selectLists({ accountIdx: accountIdx, page: page }));
    if (selectedRows.rowCount === 0) {
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    }
    const result = selectedRows.rows;

    return result;
  },
};

export default diaryService;
