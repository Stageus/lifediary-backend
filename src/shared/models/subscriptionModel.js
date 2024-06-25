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
};

export default subscriptionModel;
