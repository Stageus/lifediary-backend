import CONSTANTS from "../utils/constansts.js";

const seedCTE = ({ identifier, identifierValue, isFirstPage }) => `
  WITH updateSeed AS (
    UPDATE seed
    SET seed = CASE
      WHEN ${isFirstPage} THEN FLOOR(1 + RANDOM() * 999999999)
      ELSE seed
    END
    WHERE ${identifier} = '${identifierValue}'
    RETURNING *
  ),
  insertSeed AS (
    INSERT INTO seed (${identifier}, seed)
    SELECT '${identifierValue}', FLOOR(1 + RANDOM() * 999999999)
    WHERE NOT EXISTS (SELECT 1 FROM updateSeed)
    RETURNING *
  ),
  seedRecord AS (
    SELECT * FROM updateSeed
    UNION ALL
    SELECT * FROM insertSeed
  )
  `;

const mainColumnSelect = ({ accountIdx }) => `
  diary.idx,
  ARRAY(SELECT 
  'https://${
    process.env.AWS_BUCKETNAME
  }.s3.ap-northeast-2.amazonaws.com/' || account.idx || '/' || diary.idx || '/' || tmp
  FROM unnest(diary.imgContents) AS tmp) AS "imgContents",
  diary.textContent AS "textContent",
  diary.likeCnt AS "likeCnt",
  diary.commentCnt AS "commentCnt",
  diary.createdAt AS "createdAt",
  account.nickname,
  account.profileImg AS "profileImg",
  ${
    accountIdx
      ? `CASE WHEN EXISTS (
          SELECT 1 FROM "subscription"
          WHERE fromAccountIdx = '${accountIdx}' AND toAccountIdx = diary.accountIdx AND "subscription".isDeleted = false) THEN true
        ELSE false
      END AS isSubscribed,
      CASE WHEN EXISTS (
          SELECT 1 FROM "like" 
          WHERE accountIdx = '${accountIdx}' AND "like".diaryIdx = diary.idx AND "like".isDeleted = false) THEN true
        ELSE false
      END AS "isLiked"`
      : `false AS isSubscribed, false AS "isLiked"`
  }
`;

const diaryModel = {
  insert: ({ textContent, imgContents, tags, accountIdx, color, isPublic }) => {
    return {
      sql: `
          INSERT INTO diary
            (textContent, imgContents, tags, accountIdx, color, isPublic)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING idx
      `,
      values: [textContent, imgContents, tags, accountIdx, color, isPublic],
    };
  },
  selectAccountIdx: ({ diaryIdx }) => {
    return {
      sql: `
          SELECT accountIdx AS "accountIdx" FROM diary
          WHERE "diary".idx = $1 AND "diary".isDeleted = false;
        `,
      values: [diaryIdx],
    };
  },
  selectMainWithFirstRow: ({ accountIdx, ipAddress, diaryIdx, page }) => {
    return {
      sql: `
          ${seedCTE({
            identifier: accountIdx ? "accountIdx" : "ipAddress",
            identifierValue: accountIdx || ipAddress,
            isFirstPage: page === 1,
          })}
          SELECT ${mainColumnSelect({ accountIdx })}
          FROM diary
          JOIN account ON account.idx = diary.accountIdx
          WHERE 
            diary.isDeleted = false
            AND (diary.isPublic = true OR ${accountIdx ? `diary.accountIdx = ${accountIdx}` : "false"})
          ORDER BY 
            CASE WHEN diary.idx = $1 THEN 0 ELSE 1 END, 
            md5(diary.idx::text || (SELECT seed FROM seedRecord))
          LIMIT $2 OFFSET $3
          `,
      values: [diaryIdx, CONSTANTS.RULE.DIARY_MAIN_PAGE_LIMIT, CONSTANTS.RULE.DIARY_MAIN_PAGE_LIMIT * (page - 1)],
    };
  },
  selectMain: ({ accountIdx, ipAddress, page }) => {
    return {
      sql: `
        ${seedCTE({
          identifier: accountIdx ? "accountIdx" : "ipAddress",
          identifierValue: accountIdx || ipAddress,
          isFirstPage: page === 1,
        })}
        SELECT ${mainColumnSelect({ accountIdx })}
        FROM diary
        JOIN account ON account.idx = diary.accountIdx
        WHERE 
          diary.isDeleted = false
          AND (diary.isPublic = true OR ${accountIdx ? `diary.accountIdx = ${accountIdx}` : "false"})
        ORDER BY md5(diary.idx::text || (SELECT seed FROM seedRecord))
        LIMIT $1 OFFSET $2
        `,
      values: [CONSTANTS.RULE.DIARY_MAIN_PAGE_LIMIT, CONSTANTS.RULE.DIARY_MAIN_PAGE_LIMIT * (page - 1)],
    };
  },
  selectHome: ({ accountIdx, ipAddress, page }) => {
    return {
      sql: `
        ${seedCTE({
          identifier: accountIdx ? "accountIdx" : "ipAddress",
          identifierValue: accountIdx || ipAddress,
          isFirstPage: page === 1,
        })}
        SELECT 
          diary.idx, 
          'https://${
            process.env.AWS_BUCKETNAME
          }.s3.ap-northeast-2.amazonaws.com/' || account.idx || '/' || diary.idx || '/' || diary.imgContents[1] AS "thumbnailImg",
          account.nickname,
          account.profileImg AS "profileImg"
        FROM diary
        JOIN account ON diary.accountIdx = account.idx
        WHERE 
          diary.isDeleted = false
          AND (diary.isPublic = true OR ${accountIdx ? `diary.accountIdx = ${accountIdx}` : "false"})
        ORDER BY md5(diary.idx::text || (SELECT seed FROM seedRecord)::text)
        LIMIT $1 OFFSET $2
      `,
      values: [CONSTANTS.RULE.DIARY_HOME_PAGE_LIMIT, CONSTANTS.RULE.DIARY_HOME_PAGE_LIMIT * (page - 1)],
    };
  },
  selectSearch: ({ accountIdx, ipAddress, tags, page }) => {
    return {
      sql: `
        ${seedCTE({
          identifier: accountIdx ? "accountIdx" : "ipAddress",
          identifierValue: accountIdx || ipAddress,
          isFirstPage: page === 1,
        })},
        tagDiaryIdx AS (
          SELECT DISTINCT diaryIdx 
          FROM tag 
          WHERE tagname = ANY($1)
        )
        SELECT 
          diary.idx,
          'https://${
            process.env.AWS_BUCKETNAME
          }.s3.ap-northeast-2.amazonaws.com/' || account.idx || '/' || diary.idx || '/' || diary.imgContents[1] AS "thumbnailImg",
          diary.textContent AS "textContent",
          diary.likeCnt AS "likeCnt",
          diary.createdAt AS "createdAt",
          diary.tags,
          diary.accountIdx AS "accountIdx",
          account.nickname,
          account.profileImg AS "profileImg"
        FROM diary
        JOIN account ON diary.accountIdx = account.idx
        JOIN tagDiaryIdx ON diary.idx = tagDiaryIdx.diaryIdx
        WHERE 
          diary.isDeleted = false
          AND (diary.isPublic = true OR ${accountIdx ? `diary.accountIdx = ${accountIdx}` : "false"})
        ORDER BY md5(diary.idx::text || (SELECT seed FROM seedRecord)::text)
        LIMIT $2 OFFSET $3
      `,
      values: [tags, CONSTANTS.RULE.DIARY_SEARCH_PAGE_LIMIT, CONSTANTS.RULE.DIARY_SEARCH_PAGE_LIMIT * (page - 1)],
    };
  },
  selectGrass: ({ accountIdx, year }) => {
    const period = year
      ? `DATE '${year}-01-01',
        DATE '${year}-12-31',`
      : `CURRENT_DATE - INTERVAL '1 year', 
        CURRENT_DATE,`;

    return {
      sql: `
        WITH dates AS (
          SELECT generate_series(
            ${period}
            INTERVAL '1 day'
          )::date AS dateColumn
        )
        SELECT 
          dates.dateColumn AS "date",
          d.idx AS "idx",
          d.color AS "color"
        FROM dates
        LEFT JOIN LATERAL (
          SELECT * FROM diary AS d
          WHERE d.createdAt::date = dates.dateColumn
          AND d.isDeleted = false
          AND d.accountIdx = $1
          LIMIT 1
        ) d ON true
        ORDER BY dates.dateColumn;
      `,
      values: [accountIdx],
    };
  },
  update: ({ textContent, deletedImgs, imgContents, tags, accountIdx, color, isPublic, diaryIdx }) => {
    return {
      sql: `
        UPDATE diary
        SET imgContents = (
            SELECT array_agg(url)
            FROM unnest(imgContents) AS url
            WHERE url != ALL($1)) || $2::text[],
            textContent = $3,
            tags = $4,
            color = $5,
            isPublic = $6
        WHERE idx = $7 AND accountIdx = $8 AND isDeleted = false;
      `,
      values: [deletedImgs, imgContents, textContent, tags, color, isPublic, diaryIdx, accountIdx],
    };
  },
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
  delete: ({ diaryIdx }) => {
    return {
      sql: `
        UPDATE diary
        SET isDeleted = true
        WHERE idx = $1;
      `,
      values: [diaryIdx],
    };
  },
  restore: ({ diaryIdx }) => {
    return {
      sql: `
        UPDATE diary
        SET isDeleted = false
        WHERE idx = $1;
      `,
      values: [diaryIdx],
    };
  },
  selectFromAccount: ({ accountIdx, page, otherAccount, beginDate = "2000-01-01", endDate = "2099-12-31" }) => {
    if (otherAccount) {
      return {
        sql: `
              SELECT
                idx,
                imgContents[1] AS "thumbnail"
              FROM diary
              WHERE
                accountIdx = $1 AND
                isPublic = true AND
                isDeleted = false AND
                createdAt BETWEEN $4 AND $5
              ORDER BY createdAt DESC
              LIMIT $2 OFFSET $3;
              `,
        values: [
          accountIdx,
          CONSTANTS.RULE.DIARY_USER_PAGE_LIMIT,
          CONSTANTS.RULE.DIARY_USER_PAGE_LIMIT * (page - 1),
          beginDate,
          endDate,
        ],
      };
    } //
    else {
      return {
        sql: `
            SELECT 
              idx, 
              imgContents[1] AS "thumbnail", 
              isPublic AS "isPublic" 
            FROM diary 
            WHERE 
              accountIdx = $1 AND
              createdAt BETWEEN $4 AND $5
            ORDER BY createdAt DESC
            LIMIT $2 OFFSET $3;    
            `,
        values: [
          accountIdx,
          CONSTANTS.RULE.DIARY_USER_PAGE_LIMIT,
          CONSTANTS.RULE.DIARY_USER_PAGE_LIMIT * (page - 1),
          beginDate,
          endDate,
        ],
      };
    }
  },
  selectAccountIdxAll: ({ diaryIdx }) => {
    return {
      sql: `
            SELECT accountIdx AS "accountIdx" 
            FROM diary 
            WHERE idx = $1;
            `,
      values: [diaryIdx],
    };
  },
  updateLikeCnt: ({ diaryIdx, isPlus }) => {
    return {
      sql: `
          UPDATE diary
          SET likeCnt = CASE
            WHEN $1 THEN likeCnt + 1
            ELSE likeCnt - 1
          END
          WHERE idx = $2;
        `,
      values: [isPlus, diaryIdx],
    };
  },
};

export default diaryModel;
