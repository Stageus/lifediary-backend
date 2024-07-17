import fileType from "file-type";
import CONSTANTS from "../../../shared/utils/constansts.js";

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
      custom: {
        options: async (value, { req }) => {
          if (req.files.length !== 1) {
            throw new Error();
          }

          await Promise.all(
            req.files.map(async (file) => {
              const { ext } = await fileType.fromBuffer(file.buffer);
              if (!CONSTANTS.RULE.VALID_FILE_TYPE.includes(ext)) {
                throw new Error();
              }

              const maxMb = 10;
              const fileMb = file.size / (1024 * 1024); // 바이트를 MB로 변환
              if (fileMb > maxMb) {
                throw new Error();
              }
            })
          );
        },
      },
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
      custom: {
        options: async (value, { req }) => {
          if (req.files.length !== 1) {
            throw new Error();
          }

          await Promise.all(
            req.files.map(async (file) => {
              const { ext } = await fileType.fromBuffer(file.buffer);
              if (!CONSTANTS.RULE.VALID_FILE_TYPE.includes(ext)) {
                throw new Error();
              }

              const maxMb = 10;
              const fileMb = file.size / (1024 * 1024); // 바이트를 MB로 변환
              if (fileMb > maxMb) {
                throw new Error();
              }
            })
          );
        },
      },
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
