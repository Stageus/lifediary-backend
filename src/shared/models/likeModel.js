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
        WHERE NOT EXISTS (SELECT 1 FROM updateLike)
      `,
      values: [accountIdx, diaryIdx],
    };
  },
};

export default likeModel;
