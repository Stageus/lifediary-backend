const noticeModel = {
  selectNotices: ``,
  selectIsNew: ``,
  insertNotice: ({ fromAccountIdx, toAccountIdx, diaryIdx, noticeType }) => {
    if (!toAccountIdx) {
      return {
        sql: `
          WITH getDiaryOwner AS (
            SELECT accountIdx
            FROM diary
            WHERE idx = $3
          )
          INSERT INTO notice (noticeTypeIdx, fromAccountIdx, toAccountIdx, diaryIdx)
          SELECT $1, $2, getDiaryOwner.accountIdx, $3
          FROM getDiaryOwner
          WHERE EXISTS (
            SELECT accountIdx
            FROM getToAccountIdx
          );
        `,
        values: [noticeType, fromAccountIdx, diaryIdx],
      };
    }
    return {
      sql: ``,
      values: [fromAccountIdx, toAccountIdx, diaryIdx, noticeType],
    };
  },
  delete: ``,
};

export default noticeModel;
