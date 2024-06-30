const reportSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
};

export default reportSchema;
