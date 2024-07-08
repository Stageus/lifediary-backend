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

  insert: ({ fromAccountIdx, toAccountIdx }) => {
    return {
      sql: `
        WITH updateSubscription AS (
          UPDATE subscription
          SET isDeleted = NOT isDeleted
          WHERE fromAccountIdx = $1 AND toAccountIdx = $2
          RETURNING 1
        )
        INSERT INTO subscription (fromAccountIdx, toAccountIdx)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM updateSubscription)
      `,
      values: [fromAccountIdx, toAccountIdx],
    };
  },

  update: ({ fromAccountIdx, toAccountIdx, status }) => {
    return {
      sql: `
          UPDATE subscription 
          SET isDeleted = $1 
          WHERE fromAccountIdx = $2 AND toAccountIdx = $3;
          `,
      values: [status, fromAccountIdx, toAccountIdx],
    };
  },
};

export default subscriptionModel;
