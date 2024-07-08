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
};

export default likeModel;
