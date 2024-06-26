const subscriptionSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  post: {
    toaccountidx: {
      in: ["param"],
      notEmpty: true,
      isInt: true,
    },
  },
};

export default subscriptionSchema;
