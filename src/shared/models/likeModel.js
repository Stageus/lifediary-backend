import CONSTANTS from "../utils/constansts.js";

const likeModel = {
  insertWithUpdate: ({ accountIdx, diaryIdx }) => {
    return {
      sql: `
        WITH updateLike AS (
          UPDATE "like"
          SET isDeleted = NOT isDeleted
          WHERE accountIdx = $1 AND diaryIdx = $2
          RETURNING 1
        )
        INSERT INTO "like" (accountIdx, diaryIdx)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM updateLike);
      `,
      values: [accountIdx, diaryIdx],
    };
  },
  select: ({ accountIdx, diaryIdx }) => {
    return {
      sql: `
            SELECT idx, isDeleted AS "isDeleted" 
            FROM "like" 
            WHERE accountIdx = $1 AND diaryIdx = $2;
            `,
      values: [accountIdx, diaryIdx],
    };
  },
  updateIsDeleted: ({ accountIdx, diaryIdx, status }) => {
    return {
      sql: `
            UPDATE "like" SET isDeleted = $1 
            WHERE accountIdx = $2 AND diaryIdx = $3;
            `,
      values: [status, accountIdx, diaryIdx],
      };
  },
  selectLists: ({ accountIdx, page }) => {
    return {
      sql: `
          SELECT 
            "like".idx,
            imgContents[1] AS "thumbnail"
          FROM "like" 
          JOIN diary 
          ON "like".diaryIdx = diary.idx
          WHERE 
            "like".accountIdx = $1 AND
            "like".isDeleted = false
          ORDER BY "like".createdAt DESC
          LIMIT $2 OFFSET $3`,
      values: [accountIdx, CONSTANTS.RULE.DIARY_LIKE_PAGE_LIMIT, CONSTANTS.RULE.DIARY_LIKE_PAGE_LIMIT * (page - 1)],
    };
  },
};

export default likeModel;
