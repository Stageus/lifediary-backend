import CONSTANTS from "../utils/constansts.js";
import seedCTE from "../utils/seedCTE.js";

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
          WHERE idx = $1
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
          })},
          firstRecord AS (
            SELECT diary.idx, 
              diary.imgContents AS "imgContents", 
              diary.textContent AS "textContent",
              diary.likeCnt AS "likeCnt",
              diary.commentCnt AS "commentCnt",
              diary.createdAt AS "createdAt",
              account.nickname,
              account.profileImg AS "profileImg",
              ${
                accountIdx
                  ? `
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM "subscription"
                    WHERE fromAccountIdx = '${accountIdx}' AND toAccountIdx = diary.accountIdx
                  ) THEN true
                  ELSE false
                END AS isSubscribed,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM "like" 
                    WHERE accountIdx = '${accountIdx}' AND "like".diaryIdx = diary.idx AND isDeleted = false
                  ) THEN true
                  ELSE false
                END AS "isLiked"
              `
                  : `
                false AS isSubscribed,
                false AS "isLiked"
              `
              }
            FROM diary
            JOIN account ON account.idx = diary.accountIdx
            WHERE diary.idx = $1
            LIMIT 1
          ),
          randomRecords AS (
            SELECT diary.idx, 
              diary.imgContents AS "imgContents", 
              diary.textContent AS "textContent",
              diary.likeCnt AS "likeCnt",
              diary.commentCnt AS "commentCnt",
              diary.createdAt AS "createdAt",
              account.nickname,
              account.profileImg AS "profileImg",
              ${
                accountIdx
                  ? `
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM "subscription"
                    WHERE fromAccountIdx = '${accountIdx}' AND toAccountIdx = diary.accountIdx
                  ) THEN true
                  ELSE false
                END AS isSubscribed,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM "like" 
                    WHERE accountIdx = '${accountIdx}' AND "like".diaryIdx = diary.idx AND isDeleted = false
                  ) THEN true
                  ELSE false
                END AS "isLiked"
              `
                  : `
                false AS isSubscribed,
                false AS "isLiked"
              `
              }
            FROM diary
            JOIN account ON account.idx = diary.accountIdx
            WHERE diary.idx != $1
            ORDER BY md5(diary.idx::text || (SELECT seed FROM seedRecord))
          ),
          combined AS (
            SELECT * FROM firstRecord
            UNION ALL
            SELECT * FROM randomRecords
          )
          SELECT * FROM combined
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
        SELECT
          diary.idx,
          diary.imgContents AS "imgContents",
          diary.textContent AS "textContent",
          diary.likeCnt AS "likeCnt",
          diary.commentCnt AS "commentCnt",
          diary.createdAt AS "createdAt",
          account.nickname,
          account.profileImg AS "profileImg",
          ${
            accountIdx
              ? `
            CASE
              WHEN EXISTS (
                SELECT 1 FROM "subscription"
                WHERE fromAccountIdx = ${accountIdx} AND toAccountIdx = diary.accountIdx
              ) THEN true
              ELSE false
            END AS "isSubscribed",
            CASE
              WHEN EXISTS (
                SELECT 1 FROM "like"
                WHERE accountIdx = ${accountIdx} AND "like".diaryIdx = diary.idx AND isDeleted = false
              ) THEN true
              ELSE false
            END AS "isLiked"
          `
              : `
            false AS "isSubscribed",
            false AS "isLiked"
          `
          }
        FROM diary
        JOIN account ON account.idx = diary.accountIdx
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
          diary.imgContents[1] AS "thumbnailImg",
          account.nickname,
          account.profileImg AS "profileImg"
        FROM diary
        JOIN account ON diary.accountIdx = account.idx
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
          diary.imgContents[1] AS "thumbnailImg",
          diary.textContent AS "textContent",
          diary.likeCnt AS "likeCnt",
          diary.createdAt AS "createdAt",
          diary.tags,
          account.nickname,
          account.profileImg AS "profileImg"
        FROM diary
        JOIN account ON diary.accountIdx = account.idx
        JOIN tagDiaryIdx ON diary.idx = tagDiaryIdx.diaryIdx
        ORDER BY md5(diary.idx::text || (SELECT seed FROM seedRecord)::text)
        LIMIT $2 OFFSET $3
      `,
      values: [tags, CONSTANTS.RULE.DIARY_SEARCH_PAGE_LIMIT, CONSTANTS.RULE.DIARY_SEARCH_PAGE_LIMIT * (page - 1)],
    };
  },
  selectGrass: ({ accountIdx, year }) => {
    return {
      sql: `
        WITH dates AS (
          SELECT generate_series(
            ${
              year
                ? `
                DATE '${year - 1}-01-01',
                DATE '${year - 1}-12-31', 
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
          d.color AS "color"
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
