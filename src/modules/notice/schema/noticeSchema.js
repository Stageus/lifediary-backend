const noticeSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  delete: {
    noticeIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
};

export default noticeSchema;
