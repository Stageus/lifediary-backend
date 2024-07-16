import express from "express";
import accountController from "../controllers/accountController.js";
import accountSchema from "../schema/accountSchema.js";
import validator from "../../../shared/middlewares/validator.js";
import auth from "../../../shared/middlewares/auth.js";
import upload from "../../../shared/middlewares/upload.js";

const accountRoute = express.Router();

accountRoute

  .get("/login/oauth/google", accountController.oauthGoogle)
  .get("/login/oauth/google/redirect", accountController.oauthGoogleRedirect)
  .get("/:accountIdx", validator(accountSchema.getOtherAccount), accountController.getOtherAccount)
  .get("/", auth, accountController.get)
  .post("/", upload.array("profileImg"), validator(accountSchema.post), accountController.post)
  .put("/nickname", auth, validator(accountSchema.putNickname), accountController.putNickname)
  .get(
    "/nickname/duplication",
    validator(accountSchema.getNicknameDuplication),
    accountController.getNicknameDuplication
  )
  .put(
    "/profileImg",
    auth,
    upload.array("profileImg"),
    validator(accountSchema.putProfileImg),
    accountController.putProfileImg
  )
  .delete("/", auth, accountController.delete);

export default accountRoute;
