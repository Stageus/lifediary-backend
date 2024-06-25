import express from "express";
import accountController from "../controllers/accountController.js";
import accountSchema from "../schema/accountSchema.js";
import validator from "../../../shared/middlewares/validator.js";

const accountRoute = express.Router();

accountRoute
  .get("/login/oauth/google", accountController.oauthGoogle)
  .get("/login/oauth/google/redirect", accountController.oauthGoogleRedirect)
  .get("/", accountController.get)
  .get("/:accountidx", validator(accountSchema.getOtherAccount), accountController.getOtherAccount)
  .post("/", validator(accountSchema.post), accountController.post)
  .put("/nickname", validator(accountSchema.putNickname), accountController.putNickname)
  .get(
    "/nickname/duplication",
    validator(accountSchema.getNicknameDuplication),
    accountController.getNicknameDuplication
  )
  .put("/profileimg", validator(accountSchema.putProfileImg), accountController.putProfileImg)
  .delete("/", accountController.delete);

export default accountRoute;
