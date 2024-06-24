import express from "express";
import accountController from "../controllers/accountController.js";
import accountSchema from "../schema/accountSchema.js";
import validator from "../../../shared/middlewares/validator.js";

const accountRoute = express.Router();

accountRoute
  .get("/login/oauth/google", accountController.getRedirectUrl)
  .get("/login/oauth/google/redirect", accountController.getIsAccountExist)
  .get("/", accountController.get)
  .get("/:accountIdx", accountController)
  .post("/", validator(accountSchema.signup), accountController.signup)
  .put("/nickname", validator(accountSchema.updateNickname), accountController.updateNickname)
  .get("/nickname/duplication", validator(accountSchema.getIsNicknameExist), accountController.getIsNicknameExist)
  .put("/profileimg", validator(accountSchema.updateProfileImg), accountController.updateProfileImg)
  .delete("/", accountController.delete);

export default accountRoute;
