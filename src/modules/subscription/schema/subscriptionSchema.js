const subscriptionSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
};

export default subscriptionSchema;
