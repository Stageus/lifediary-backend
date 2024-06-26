import CONSTANTS from "../utils/constansts.js";

const subscriptionModel = {
  select: ({ fromAccountIdx, toAccountIdx }) => {
    return {
      sql: `
              SELECT isDeleted AS "isDeleted"
              FROM subscription
              WHERE fromAccountIdx = $1 AND toAccountIdx = $2;
              `,
      values: [fromAccountIdx, toAccountIdx],
    };
  },

  selectList: ({ fromAccountIdx, page }) => {
    return {
      sql: `
          SELECT 
            subscription.toaccountidx AS "toAccountIdx", 
            account.profileimg AS "profileImg", 
            account.nickname
          FROM subscription 
          JOIN account 
          ON subscription.toaccountidx = account.idx 
          WHERE fromaccountidx = $1 AND subscription.isdeleted = false  
          LIMIT $2 OFFSET $3;
          `,
      values: [
        fromAccountIdx,
        CONSTANTS.RULE.SUBSCRIPTION_PAGE_LIMIT,
        CONSTANTS.RULE.SUBSCRIPTION_PAGE_LIMIT * (page - 1),
      ],
    };
  },
};

export default subscriptionModel;
