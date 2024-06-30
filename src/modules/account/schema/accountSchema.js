const accountSchema = {
  post: {
    oauthGoogleId: {
      in: ["body"],
      notEmpty: true,
    },
    nickname: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 20 } },
    },
    profileImg: {
      in: ["body"],
      notEmpty: true,
    },
  },

  putNickname: {
    nickname: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 20 } },
    },
  },

  getNicknameDuplication: {
    nickname: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 20 } },
    },
  },

  putProfileImg: {
    profileImg: {
      in: ["body"],
      notEmpty: true,
    },
  },
  getOtherAccount: {
    accountIdx: {
      in: ["param"],
      notEmpty: true,
      isInt: true,
    },
  },
};

export default accountSchema;
