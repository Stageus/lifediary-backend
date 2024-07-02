const reportSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  post: {
    diaryIdx: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
    textContent: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { min: 5, max: 300 } },
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
