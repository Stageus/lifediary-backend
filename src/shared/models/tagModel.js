const tagModel = {
  insertMany: ({ diaryIdx, tags }) => {
    return {
      sql: `
          INSERT INTO tag (diaryIdx, tagName)
          SELECT $1, newTags.tagName
          FROM ( SELECT unnest($2::text[]) AS tagName ) AS newTags;
        `,
      values: [diaryIdx, tags],
    };
  },
  deleteMany: () => {},
};

export default tagModel;
