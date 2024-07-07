import CONSTANTS from "../utils/constansts.js";

const reportModel = {
  selectList: ({ page }) => {
    return {
      sql: `
            SELECT 
                report.idx, 
                report.diaryidx AS "diaryIdx", 
                account.nickname, 
                report.textcontent AS "textContent", 
                report.isinvalid AS "isInvalid", 
                report.createdat AS "createdAt"
            FROM report 
            JOIN account 
            ON report.accountidx = account.idx
            ORDER BY report.createdAt DESC
            LIMIT $1 OFFSET $2
            `,
      values: [CONSTANTS.RULE.REPORT_PAGE_LIMIT, CONSTANTS.RULE.REPORT_PAGE_LIMIT * (page - 1)],
    };
  },

  selectCnt: () => {
    return {
      sql: `
            WITH reportCnt AS (
            SELECT COUNT(*) AS reports FROM report
            )
            SELECT (reports + $1) / $2 AS "maxPage"
            FROM reportCnt;
            `,
      values: [CONSTANTS.RULE.REPORT_PAGE_LIMIT - 1, CONSTANTS.RULE.REPORT_PAGE_LIMIT],
    };
  },

  selectNew: () => {
    return {
      sql: `SELECT idx FROM report WHERE isInvalid IS NULL;`,
    };
  },

  selectIdx: ({ reportIdx }) => {
    return {
      sql: `SELECT 
            idx, 
            diaryIdx AS "diaryIdx", 
            accountIdx AS "accountIdx", 
            isInvalid AS "isInvalid" 
            FROM report WHERE idx = $1;`,
      values: [reportIdx],
    };
  },

  insert: ({ accountIdx, diaryIdx, textContent }) => {
    return {
      sql: `
            INSERT INTO report (accountIdx, diaryIdx, textContent) 
            VALUES ($1, $2, $3);
            `,
      values: [accountIdx, diaryIdx, textContent],
    };
  },

  update: ({ reportIdx, isInvalid }) => {
    return {
      sql: `UPDATE report
            SET isInvalid = $1,
            processedAt = CURRENT_TIMESTAMP
            WHERE idx = $2;
            `,
      values: [isInvalid, reportIdx],
    };
  },
};

export default reportModel;
