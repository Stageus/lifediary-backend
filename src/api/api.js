import express from "express";
import accountController from "../controllers/accountController.js";
import commentController from "../controllers/commentController.js";

const api = express.Router();

api
  .get("/auth", accountController.getAuth)
  .get("/account/login/oauth/google", accountController.getRedirectUrl)
  .get("/account/login/oauth/google/redirect", accountController.getIsAccountExist)
  .get("/account", accountController.get)
  //   .get('/account/profileImg', accountController)
  //   .get('/account/:accountIdx', accountController)
  //   .post('/account', accountController)
  //   .put('/account/nickname', accountController)
  //   .get('/account/nickname/duplication', accountController)
  //   .put('/account/profileImg', accountController)
  //   .delete('/account', accountController)
  //   //
  //   .get('/subscription', subscriptionController)
  //   .post('/subscription/:toAccountIdx', subscriptionController)
  //   //
  //   .get('/grass', grassController)
  //   //
  //   .get('/diary', diaryController)
  //   .get('/diary/search', diaryController)
  //   .get('/diary/home', diaryController)
  //   .get('/diary/:diaryIdx', diaryController)
  //   .get('/diary/mypage/mine', diaryController)
  //   .get('/diary/mypage/like', diaryController)
  //   .get('/diary/userpage/:accountIdx/mine', diaryController)
  //   .post('/diary', diaryController)
  //   .put('/diary/:diaryIdx', diaryController)
  //   .delete('/diary/:diaryIdx', diaryController)
  //   .post('/diary/:diaryIdx/like', diaryController)
  //   //
  //   .get('/comment', commentController)
  //   .post('/comment', commentController)
  //   .post('/comment/:commentIdx/reply', commentController)
  //   .put('/comment/:commentIdx', commentController)
  //   .delete('/comment/:commentIdx', commentController)
  //
  .get("/comment", commentController.get)
  .post("/comment", commentController.post)
  .post("/comment/:parentCommentIdx/reply", commentController.postReply)
  .put("/comment/:commentIdx", commentController.put)
  .delete("/comment/:commentIdx", commentController.delete);
//   //
//   .get('/report', reportController)
//   .get('/report/new', reportController)
//   .post('/report', reportController)
//   .put('/report/:reportIdx/status', reportController)
//   //
//   .get('/notice', noticeController)
//   .delete('/notice/:noticeIdx', noticeController)
//   .get('/notice/new', noticeController)

export default api;
