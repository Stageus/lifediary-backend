const reportSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },

  putStatus: {
    isInvalid: {
      in: ["body"],
      exists: true,
      isIn: { options: [[null, true, false]] },
    },
    reportIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
};

export default reportSchema;
