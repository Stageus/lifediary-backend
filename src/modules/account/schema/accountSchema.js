const accountSchema = {
  signup: {
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
};

export default accountSchema;
