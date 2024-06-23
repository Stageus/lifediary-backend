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
  updateNickname: {
    nickname: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 20 } },
    },
  },
  getIsNicknameExist: {
    nickname: {
      in: ["body"],
      notEmpty: true,
      isLength: { options: { max: 20 } },
    },
  },
  updateProfileImg: {
    profileImg: {
      in: ["body"],
      notEmpty: true,
    },
  },
};

export default accountSchema;
