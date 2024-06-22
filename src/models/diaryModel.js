const diaryModel = {
  insert: () => {},
  select: ({ diaryIdx }) => {
    return {
      sql: `
          SELECT 1 FROM diary
          WHERE idx = $1
        `,
      values: [diaryIdx],
    };
  },
  selectMain: () => {},
  selectHome: () => {},
  selectSearch: () => {},
  selectLike: () => {},
  selectMine: () => {},
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
