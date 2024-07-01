const tagModel = {
  insert: ({ diaryIdx, tags }) => {
    return {
      sql: `
          INSERT INTO tag (diaryIdx, tagName)
          SELECT $1, newTags.tagName
          FROM ( SELECT unnest($2::text[]) AS tagName ) AS newTags;
        `,
      values: [diaryIdx, tags],
    };
  },
  update: ({ diaryIdx, tags }) => {
    return {
      sql: `
        WITH newTags AS ( 
          SELECT unnest($2::text[]) AS tagName,
          generate_series(1, array_length($2::text[], 1)) AS position
        ),
        existingTags AS ( 
          SELECT idx, tagName, row_number() OVER (ORDER BY idx) AS position
          FROM tag
          WHERE diaryIdx = $1
        ),
        updateTags AS (
          UPDATE tag
          SET tagName = nt.tagName
          FROM existingTags AS et
          JOIN newTags AS nt ON et.position = nt.position
          WHERE tag.idx = et.idx AND tag.diaryIdx = $1
        ),
        insertTags AS (
          INSERT INTO tag (diaryIdx, tagName)
          SELECT $1, nt.tagName
          FROM newTags AS nt
          LEFT JOIN existingTags AS et ON nt.position = et.position
          WHERE et.tagName IS NULL
        )
        DELETE FROM tag
        WHERE diaryIdx = $1
        AND idx NOT IN (
          SELECT idx FROM tag
          WHERE diaryIdx = $1
          ORDER BY idx
          LIMIT array_length($2::text[], 1)
        );
    `,
      values: [diaryIdx, tags],
    };
  },
};

export default tagModel;
