import { CONSTANTS } from '../utils/constansts.js'
import psqlPool from '../utils/psqlPool.js'

const commentModel = {
  insert: () => {},
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
  update: () => {},
}

export default commentModel
