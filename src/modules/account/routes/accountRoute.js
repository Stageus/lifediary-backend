import express from "express";
import accountController from "../controllers/accountController.js";
import accountSchema from "../schema/accountSchema.js";
import validator from "../../../shared/middlewares/validator.js";

const accountRoute = express.Router();

accountRoute
  .get("/login/oauth/google", accountController.getRedirectUrl)
  .get("/login/oauth/google/redirect", accountController.getIsAccountExist)
  .get("/", accountController.get)
  //   .get('/profileImg', accountController)
  //   .get('/:accountIdx', accountController)
  .post("/", validator(accountSchema.signup), accountController.signup)
  .put("/nickname", validator(accountSchema.updateNickname), accountController.updateNickname);
//   .get('/nickname/duplication', accountController)
//   .put('/profileImg', accountController)
//   .delete('/', accountController)

export default accountRoute;
