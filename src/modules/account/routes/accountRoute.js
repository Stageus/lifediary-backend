import express from "express";
import accountController from "../controllers/accountController.js";

const accountRoute = express.Router();

accountRoute
  .get("/login/oauth/google", accountController.getRedirectUrl)
  .get("/login/oauth/google/redirect", accountController.getIsAccountExist);
//   .get('/', accountController)
//   .get('/profileImg', accountController)
//   .get('/:accountIdx', accountController)
//   .post('/', accountController)
//   .put('/nickname', accountController)
//   .get('/nickname/duplication', accountController)
//   .put('/profileImg', accountController)
//   .delete('/', accountController)

export default accountRoute;
