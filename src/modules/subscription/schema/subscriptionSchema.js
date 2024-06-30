const subscriptionSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  post: {
    toAccountIdx: {
      in: ["param"],
      notEmpty: true,
      isInt: true,
    },
  },
};

export default subscriptionSchema;
