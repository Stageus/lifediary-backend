const CONSTANTS = Object.freeze({
  MSG: Object.freeze({
    500: "something broke",
    404: "no resouce",
    403: "wrong access",
    400: "unvalid value",
  }),
  RULE: Object.freeze({
    COMMENT_PAGE_LIMIT: 10,
  }),
  NOTICE_TYPE: Object.freeze({
    NEW_COMMENT: "newComment",
    NEW_DIARY: "newDiary",
    DELETED_DIARY: "deletedDiary",
    DELETED_MY_DIARY: "deletedMyDiary",
    RECOVERED_DIARY: "recoveredDiary",
  }),
});

export default CONSTANTS;
