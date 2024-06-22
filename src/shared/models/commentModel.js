import CONSTANTS from "../utils/constansts.js";

const commentModel = {
  selectDiaryOwnerIdx: ({ parentCommentIdx }) => {
    return {
      sql: `
        SELECT c.parentCommentIdx, d.accountIdx AS "accountIdx"
        FROM comment AS c
        JOIN diary AS d ON d.idx = c.diaryIdx
        WHERE c.idx = $1
      `,
      values: [parentCommentIdx],
    };
  },
  selectCommentOwnerIdx: ({ commentIdx }) => {
    return {
      sql: `
        SELECT c.accountIdx AS "accountIdx"
        FROM comment AS c
        WHERE c.idx = $1
      `,
      values: [commentIdx],
    };
  },
  insertReply: ({ textContent, accountIdx, parentCommentIdx }) => {
    return {
      sql: `
        WITH tmp AS (
          SELECT diaryIdx
          FROM comment AS parentComment
          WHERE parentComment.idx = $3
        )
        INSERT INTO comment (diaryIdx, accountIdx, textContent, parentCommentIdx)
        SELECT tmp.diaryIdx, $1, $2, $3 
        FROM tmp
      `,
      values: [accountIdx, textContent, parentCommentIdx],
    };
  },
  insert: ({ diaryIdx, textContent, accountIdx }) => {
    return {
      sql: `
          WITH isDiaryExist AS (
            SELECT 1
            FROM diary 
            WHERE idx = $1
          )
          INSERT INTO comment (diaryIdx, accountIdx, textContent)
          SELECT $1, $2, $3
          WHERE EXISTS 
            (SELECT 1 FROM isDiaryExist)
      `,
      values: [diaryIdx, accountIdx, textContent],
    };
  },
  selectList: ({ diaryIdx, accountIdx, page }) => {
    return {
      sql: `
        SELECT 
          c.idx AS "idx",
          a.profileImg AS "profileImg",
          a.nickname AS "nickname",
          c.textContent AS "textContent",
        CASE
          WHEN c.parentCommentIdx IS NULL THEN true
          ELSE false
        END AS "isParent",
        CASE 
          WHEN c.accountIdx = $2 THEN true
          ELSE false
        END AS "isMine"
        FROM comment AS c
        JOIN account AS a ON c.accountIdx = a.idx
        JOIN diary AS d ON c.diaryIdx = d.idx
        WHERE c.diaryIdx = $1 AND d.isDeleted IS false
        ORDER BY 
          CASE
            WHEN c.parentCommentIdx IS NULL THEN c.idx
            ELSE c.parentCommentIdx
          END ASC, 
          c.idx ASC
        LIMIT $3 OFFSET $4
      `,
      values: [diaryIdx, accountIdx, CONSTANTS.RULE.COMMENT_PAGE_LIMIT, CONSTANTS.RULE.COMMENT_PAGE_LIMIT * (page - 1)],
    };
  },
  update: ({ commentIdx, textContent, accountIdx }) => {
    return {
      sql: `
        UPDATE comment
        SET textContent = $1
        WHERE idx = $2 AND accountIdx = $3
      `,
      values: [textContent, commentIdx, accountIdx],
    };
  },
  delete: ({ commentIdx, accountIdx }) => {
    return {
      sql: `
        DELETE FROM comment
        WHERE idx = $1 AND accountIdx = $2
      `,
      values: [commentIdx, accountIdx],
    };
  },
};

export default commentModel;
