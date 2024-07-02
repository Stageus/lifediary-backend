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
            LIMIT $1 OFFSET $2
            `,
      values: [CONSTANTS.RULE.REPORT_PAGE_LIMIT, CONSTANTS.RULE.REPORT_PAGE_LIMIT * (page - 1)],
    };
  },

  selectCnt: () => {
    return {
      sql: `SELECT COUNT(*) FROM report;`,
    };
  },

  selectNew: () => {
    return {
      sql: `SELECT idx FROM report WHERE isInvalid IS NULL;`,
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
};

export default reportModel;
