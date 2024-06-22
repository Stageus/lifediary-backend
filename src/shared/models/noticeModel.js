import CONSTANTS from "../utils/constansts.js";

const noticeModel = {
  select: ({ noticeIdx }) => {
    return {
      sql: `
        SELECT toAccountIdx AS "toAccountIdx"
        FROM notice AS n
        WHERE n.idx = $1
      `,
      values: [noticeIdx],
    };
  },
  selectNotices: ({ toAccountIdx, page }) => {
    return {
      sql: `
        SELECT 
          n.idx AS "idx", 
          n.diaryIdx AS "diaryIdx", 
          a.nickname AS "nickname",
          n.noticeTypeIdx AS "noticeType", 
          n.createdAt AS "createdAt"
        FROM notice AS n
        JOIN account AS a ON n.fromAccountIdx = a.idx
        WHERE n.toAccountIdx = $1
        ORDER BY n.createdAt DESC
        LIMIT $2 OFFSET $3
      `,
      values: [toAccountIdx, CONSTANTS.RULE.NOTICE_PAGE_LIMIT, CONSTANTS.RULE.NOTICE_PAGE_LIMIT * (page - 1)],
    };
  },
  selectIsNew: ({ toAccountIdx }) => {
    return {
      sql: `
        SELECT EXISTS (
          SELECT 1
          FROM notice AS n
          WHERE n.toAccountIdx = $1 AND isRead = false
        ) AS "isNew";
      `,
      values: [toAccountIdx],
    };
  },
  insert: ({ fromAccountIdx, toAccountIdx, diaryIdx, noticeType }) => {
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
          WHERE EXISTS ( SELECT accountIdx FROM getDiaryOwner );
        `,
        values: [noticeType, fromAccountIdx, diaryIdx],
      };
    }
    return {
      sql: ``,
      values: [fromAccountIdx, toAccountIdx, diaryIdx, noticeType],
    };
  },
  updateRead: ({ toAccountIdx }) => {
    return {
      sql: `
        UPDATE notice
        SET isRead = true
        WHERE toAccountIdx = $1
      `,
      values: [toAccountIdx],
    };
  },
  delete: ({ noticeIdx, toAccountIdx }) => {
    return {
      sql: `
        DELETE FROM notice
        WHERE idx = $1 AND toAccountIdx = $2
      `,
      values: [noticeIdx, toAccountIdx],
    };
  },
};

export default noticeModel;
