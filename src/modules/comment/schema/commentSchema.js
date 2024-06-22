const commentSchema = {
  get: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
    diaryIdx: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  post: {
    textContent: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 300 } },
    },
    diaryIdx: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  postReply: {
    textContent: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 300 } },
    },
    parentCommentIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
  put: {
    textContent: {
      in: ["body"],
      notEmpty: true,
    },
    commentIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
  delete: {
    parentCommentIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
};

export default commentSchema;
