const diaryModel = {
  insert: () => {},
  selectAccountIdx: ({ diaryIdx }) => {
    return {
      sql: `
          SELECT accountIdx AS "accountIdx" FROM diary
          WHERE idx = $1
        `,
      values: [diaryIdx],
    };
  },
  selectMainPage: () => {},
  selectHomePage: () => {},
  selectSearchPage: () => {},
  selectLikeTab: () => {},
  selectMineTab: () => {},
  selectGrass: ({ accountIdx, year }) => {
    return {
      sql: `
        WITH dates AS (
          SELECT generate_series(
            ${
              year
                ? `
                DATE '${new Date(year, 0, 1).toISOString().slice(0, 10)}',
                DATE '${new Date(year, 11, 31).toISOString().slice(0, 10)}', 
              `
                : `
                CURRENT_DATE - INTERVAL '1 year', 
                CURRENT_DATE,
              `
            }
            INTERVAL '1 day'
          )::date AS dateColumn
        )
        SELECT 
          dates.dateColumn AS "date",
          d.idx AS "idx",
          d.color AS "color",
          d.createdAt AS "createdAt"
        FROM dates
        LEFT JOIN LATERAL (
          SELECT * FROM diary AS d
          WHERE d.createdAt::date = dates.dateColumn
          AND d.accountIdx = $1
          LIMIT 1
        ) d ON true
        ORDER BY dates.dateColumn;
      `,
      values: [accountIdx],
    };
  },
  update: () => {},
  updateCommentCnt: ({ diaryIdx, commentIdx, isPlus }) => {
    if (!commentIdx) {
      return {
        sql: `
          UPDATE diary
          SET commentCnt = CASE
            WHEN $1 THEN commentCnt + 1
            ELSE commentCnt - 1
          END
          WHERE idx = $2;
  
        `,
        values: [isPlus, diaryIdx],
      };
    }
    if (!diaryIdx) {
      return {
        sql: `
          UPDATE diary
          SET commentCnt = CASE
            WHEN $1 THEN commentCnt + 1
            ELSE commentCnt - 1
          END
          WHERE idx = (SELECT diaryIdx FROM comment WHERE idx = $2);
        `,
        values: [isPlus, commentIdx],
      };
    }
  },
  delete: () => {},
};

export default diaryModel;
