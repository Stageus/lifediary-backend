import fileType from "file-type";
import CONSTANTS from "../../../shared/utils/constansts.js";

const diarySchema = {
  getMain: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  getHome: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
  getSearch: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
    tags: {
      in: ["query"],
      custom: {
        options: (value) => {
          const tags = typeof value === "string" ? JSON.parse(value) : value || [];
          if (!Array.isArray(tags)) {
            return false;
          }
          for (const tag of tags) {
            if (!typeof tag === "string") {
              return false;
            }
            if (tag.length > 20) {
              return false;
            }
          }
          return true;
        },
      },
      notEmpty: true,
    },
  },
  getMainWithFirstData: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
    diaryIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
  post: {
    imgContents: {
      custom: {
        options: async (value, { req }) => {
          if (req.files.length > 3) {
            return false;
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

          return true;
        },
      },
    },
    textContent: {
      in: ["body"],
      isLength: { options: { max: 500 } },
    },
    tags: {
      in: ["body"],
      custom: {
        options: (value) => {
          const tags = typeof value === "string" ? JSON.parse(value) : value || [];
          if (!Array.isArray(tags)) {
            return false;
          }
          if (tags.length > 4) {
            return false;
          }
          for (const tag of tags) {
            if (!typeof tag === "string") {
              return false;
            }
            if (tag.length > 20) {
              return false;
            }
          }
          return true;
        },
      },
      notEmpty: true,
    },
    isPublic: {
      in: ["body"],
      notEmpty: true,
      custom: {
        options: (value) => {
          const isPublic = typeof value === "string" ? JSON.parse(value) : value || [];
          if (typeof isPublic !== "boolean") {
            return false;
          }
          return true;
        },
      },
    },
    color: {
      in: ["body"],
      notEmpty: true,
      custom: {
        options: (color) => {
          return typeof color === "string" && color[0] === "#" && color.length <= 7;
        },
      },
    },
  },
  put: {
    diaryIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
    imgContents: {
      custom: {
        options: async (value, { req }) => {
          if (req.files.length > 3) {
            return false;
          }

          await Promise.all(
            req.files.map(async (file) => {
              const { ext } = await fileType.fromBuffer(file.buffer);
              if (!CONSTANTS.RULE.VALID_FILE_TYPE.includes(ext)) {
                throw new Error();
              }

              const maxMb = 10;
              const fileMb = file.size / (1024 * 1024);
              if (fileMb > maxMb) {
                throw new Error();
              }
            })
          );

          return true;
        },
      },
    },
    textContent: {
      in: ["body"],
      isLength: { options: { max: 500 } },
    },
    deletedImgs: {
      in: ["body"],
      custom: {
        options: (value) => {
          const deletedImgs = typeof value === "string" ? JSON.parse(value) : value || [];
          if (!Array.isArray(deletedImgs)) {
            return false;
          }
          if (deletedImgs.length > 3) {
            return false;
          }
          for (const deletedImg of deletedImgs) {
            const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            if (!regex.test(deletedImg)) {
              return false;
            }
          }
          return true;
        },
      },
    },
    tags: {
      in: ["body"],
      custom: {
        options: (value) => {
          const tags = typeof value === "string" ? JSON.parse(value) : value || [];
          if (!Array.isArray(tags)) {
            return false;
          }
          if (tags.length > 4) {
            return false;
          }
          for (const tag of tags) {
            if (!typeof tag === "string") {
              return false;
            }
            if (tag.length > 20) {
              return false;
            }
          }
          return true;
        },
      },
      notEmpty: true,
    },
    isPublic: {
      in: ["body"],
      notEmpty: true,
      custom: {
        options: (value) => {
          const isPublic = typeof value === "string" ? JSON.parse(value) : value;
          if (typeof isPublic !== "boolean") {
            return false;
          }
          return true;
        },
      },
    },
    color: {
      in: ["body"],
      notEmpty: true,
      custom: {
        options: (color) => {
          return typeof color === "string" && color[0] === "#" && color.length <= 7;
        },
      },
    },
  },
  delete: {
    diaryIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
  getUserpage: {
    accountIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
  like: {
    diaryIdx: {
      in: ["param"],
      isInt: true,
      notEmpty: true,
    },
  },
  getMypageMine: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
    beginDate: {
      in: ["query"],
      matches: {
        options: [/^\d{4}-\d{2}-\d{2}$/],
      },
      optional: true,
    },
    endDate: {
      in: ["query"],
      matches: {
        options: [/^\d{4}-\d{2}-\d{2}$/],
      },
      optional: true,
    },
  },
  getMypageLike: {
    page: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
    },
  },
};

export default diarySchema;
