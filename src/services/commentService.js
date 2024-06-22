import commentModel from "../models/commentModel.js";
import CONSTANTS from "../utils/constansts.js";
import jwtVerify from "../utils/jwtVerify.js";
import sendError from "../utils/sendError.js";

const commentService = {
  selectComments: async (req, res) => {
    const { page, diaryIdx } = req.query;
    const { accountIdx } = jwtVerify(req.headers.token);

    const result = await commentModel
      .selectList({
        diaryIdx: diaryIdx,
        accountIdx: accountIdx,
        page: page,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    if (result.rowCount === 0)
      sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  insert: async (req, res) => {
    const { diaryIdx } = req.query;
    const { textContent } = req.body;
    const { accountIdx } = jwtVerify(req.headers.token);

    const result = await commentModel
      .insert({
        diaryIdx: diaryIdx,
        accountIdx: accountIdx,
        textContent: textContent,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    if (result.rowCount === 0)
      sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  insertReply: async (req, res) => {
    const { parentCommentIdx } = req.params;
    const { textContent } = req.body;
    const { accountIdx } = jwtVerify(req.headers.token);

    const check = await commentModel
      .selectDiaryOwnerIdx({
        parentCommentIdx: parentCommentIdx,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    if (check.rowCount === 0)
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx)
      sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await commentModel
      .insertReply({
        accountIdx: accountIdx,
        textContent: textContent,
        parentCommentIdx: parentCommentIdx,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    return result.rows;
  },
  update: async (req, res) => {
    const { commentIdx } = req.params;
    const { textContent } = req.body;
    const { accountIdx } = jwtVerify(req.headers.token);

    const check = await commentModel
      .selectCommentOwnerIdx({
        commentIdx: commentIdx,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    if (check.rowCount === 0)
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx)
      sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await commentModel
      .update({
        commentIdx: commentIdx,
        accountIdx: accountIdx,
        textContent: textContent,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    return result.rows;
  },
  delete: async (req, res) => {
    const { commentIdx } = req.params;
    const { accountIdx } = jwtVerify(req.headers.token);

    const check = await commentModel
      .selectCommentOwnerIdx({
        commentIdx: commentIdx,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    if (check.rowCount === 0)
      sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx)
      sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await commentModel
      .delete({
        commentIdx: commentIdx,
        accountIdx: accountIdx,
      })
      .catch((err) =>
        sendError({
          status: 500,
          message: CONSTANTS.MSG[500],
          stack: err.stack,
        })
      );

    return result.rows;
  },
};

export default commentService;
