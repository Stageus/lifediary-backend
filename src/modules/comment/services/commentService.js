import commentModel from "../../../shared/models/commentModel.js";
import diaryModel from "../../../shared/models/diaryModel.js";
import noticeModel from "../../../shared/models/noticeModel.js";
import CONSTANTS from "../../../shared/utils/constansts.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";
import sendError from "../../../shared/utils/sendError.js";

const commentService = {
  selectComments: async (req, res) => {
    const { page, diaryIdx } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(
      commentModel.selectList({ diaryIdx: diaryIdx, accountIdx: accountIdx, page: page })
    );

    if (result.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    return result.rows;
  },
  insert: async (req, res) => {
    const { diaryIdx } = req.query;
    const { textContent } = req.body;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(diaryModel.select({ diaryIdx: diaryIdx }));

    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });

    const result = await psqlConnect.transaction([
      commentModel.insert({ diaryIdx: diaryIdx, accountIdx: accountIdx, textContent: textContent }),
      diaryModel.updateCommentCnt({ diaryIdx: diaryIdx, isPlus: true }),
      noticeModel.insertNotice({
        fromAccountIdx: accountIdx,
        diaryIdx: diaryIdx,
        noticeType: CONSTANTS.NOTICE_TYPE.NEW_COMMENT,
      }),
    ]);

    return result.rows;
  },
  insertReply: async (req, res) => {
    const { parentCommentIdx } = req.params;
    const { textContent } = req.body;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(commentModel.selectDiaryOwnerIdx({ parentCommentIdx: parentCommentIdx }));

    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx) sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await psqlConnect.query(
      commentModel.insertReply({ accountIdx: accountIdx, textContent: textContent, parentCommentIdx: parentCommentIdx })
    );

    return result.rows;
  },
  update: async (req, res) => {
    const { commentIdx } = req.params;
    const { textContent } = req.body;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(commentModel.selectCommentOwnerIdx({ commentIdx: commentIdx }));

    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx) sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await psqlConnect.query(
      commentModel.update({ commentIdx: commentIdx, accountIdx: accountIdx, textContent: textContent })
    );

    return result.rows;
  },
  delete: async (req, res) => {
    const { commentIdx } = req.params;
    const { accountIdx } = jwt.verify(req.headers.token);

    const check = await psqlConnect.query(commentModel.selectCommentOwnerIdx({ commentIdx: commentIdx }));

    if (check.rowCount === 0) sendError({ status: 404, message: CONSTANTS.MSG[404] });
    if (check.rows[0].accountIdx !== accountIdx) sendError({ status: 403, message: CONSTANTS.MSG[403] });

    const result = await psqlConnect.transaction([
      commentModel.delete({ commentIdx: commentIdx, accountIdx: accountIdx }),
      diaryModel.updateCommentCnt({ commentIdx: commentIdx, isPlus: false }),
    ]);

    return result.rows;
  },
};

export default commentService;
