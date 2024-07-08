const CONSTANTS = Object.freeze({
  MSG: Object.freeze({
    500: "something broke",
    409: "conflict with server",
    404: "no resouce",
    401: "auth failure",
    403: "wrong access",
    400: "unvalid value",
  }),
  RULE: Object.freeze({
    COMMENT_PAGE_LIMIT: 10,
    DIARY_MAIN_PAGE_LIMIT: 10,
    DIARY_SEARCH_PAGE_LIMIT: 10,
    DIARY_HOME_PAGE_LIMIT: 15,
    DIARY_USER_PAGE_LIMIT: 10,
    NOTICE_PAGE_LIMIT: 10,
    REPORT_PAGE_LIMIT: 5,
    SUBSCRIPTION_PAGE_LIMIT: 20,
    VALID_FILE_TYPE: Object.freeze(["png", "gif", "jpg", "jpeg"]),
  }),
  NOTICE_TYPE: Object.freeze({
    NEW_COMMENT: "newComment",
    NEW_DIARY: "newDiary",
    DELETED_DIARY: "deletedDiary",
    DELETED_MY_DIARY: "deletedMyDiary",
    RECOVERED_DIARY: "recoveredDiary",
  }),
  LOG_HEADER: Object.freeze([
    { id: "status", title: "STATUS" },
    { id: "method", title: "METHOD" },
    { id: "url", title: "URL" },
    { id: "accountIdx", title: "ACCOUNT_IDX" },
    { id: "reqParams", title: "REQ_PARAMS" },
    { id: "reqBody", title: "REQ_BODY" },
    { id: "reqQuery", title: "REQ_QUERY" },
    { id: "resMessage", title: "RES_MESSAGE" },
    { id: "responseTime", title: "RESPONSE_TIME" },
    { id: "createdAt", title: "CREATED_AT" },
    { id: "errStack", title: "LOG" },
  ]),
  ALLOWED_PERMISSION: Object.freeze(["admin"]),
});

export default CONSTANTS;
