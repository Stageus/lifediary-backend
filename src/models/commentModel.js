import { CONSTANTS } from '../utils/constansts.js'
import psqlPool from '../utils/psqlPool.js'

const commentModel = {
  selectDiaryOwnerIdx: async ({ parentCommentIdx }) => {
    const values = [parentCommentIdx]
    const sql = `
      SELECT c.parentCommentIdx, d.accountIdx AS "accountIdx"
      FROM comment AS c
      JOIN diary AS d ON d.idx = c.diaryIdx
      WHERE c.idx = $1
    `

    return await psqlPool.query(sql, values)
  },
  selectCommentOwnerIdx: async ({ commentIdx }) => {
    const values = [commentIdx]
    const sql = `
      SELECT c.accountIdx AS "accountIdx"
      FROM comment AS c
      WHERE c.idx = $1
    `

    return await psqlPool.query(sql, values)
  },
  insertReply: async ({ textContent, accountIdx, parentCommentIdx }) => {
    const values = [accountIdx, textContent, parentCommentIdx]
    const sql = `
      WITH tmp AS (
        SELECT diaryIdx
        FROM comment AS parentComment
        WHERE parentComment.idx = $3
      )
      INSERT INTO comment (diaryIdx, accountIdx, textContent, parentCommentIdx)
      SELECT tmp.diaryIdx, $1, $2, $3 
      FROM tmp
    `

    return await psqlPool.query(sql, values)
  },
  insert: async ({ diaryIdx, textContent, accountIdx }) => {
    const values = [diaryIdx, accountIdx, textContent]
    const sql = `
      isDiaryExist AS (
        SELECT 1
        FROM diary 
        WHERE idx = $1
      )
      INSERT INTO comment (diaryIdx, accountIdx, textContent)
      SELECT $1, $2, $3
      WHERE EXISTS 
        (SELECT 1 FROM isDiaryExist);
    `

    return await psqlPool.query(sql, values)
  },
  selectList: async ({ diaryIdx, accountIdx, page }) => {
    const values = [
      diaryIdx,
      accountIdx,
      CONSTANTS.COMMENT_PAGE_LIMIT,
      CONSTANTS.COMMENT_PAGE_LIMIT * (page - 1),
    ]

    const sql = `
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
    `
    return await psqlPool.query(sql, values)
  },
  delete: () => {},
  update: async ({ commentIdx, textContent, accountIdx }) => {
    const values = [textContent, commentIdx, accountIdx]
    const sql = `
      UPDATE comment
      SET textContent = $1
      WHERE idx = $2 AND accountIdx = $3
    `

    return await psqlPool.query(sql, values)
  },
}

export default commentModel
