import express from "express";
import diaryController from "../controllers/diaryController.js";
import upload from "../../../shared/middlewares/upload.js";
import validator from "../../../shared/middlewares/validator.js";
import diarySchema from "../schema/diarySchema.js";
import auth from "../../../shared/middlewares/auth.js";

const diaryRoute = express.Router();

diaryRoute //
  .get("/home", validator(diarySchema.getHome), diaryController.getHome)
  .get("/search", validator(diarySchema.getSearch), diaryController.getSearch)
  .get("/:diaryIdx", validator(diarySchema.getMainWithFirstData), diaryController.getMainWithFirstData)
  .get("/", validator(diarySchema.getMain), diaryController.getMain)
  .post("/", auth, upload.array("imgContents"), validator(diarySchema.post), diaryController.post)
  .put("/:diaryIdx", auth, upload.array("imgContents"), validator(diarySchema.put), diaryController.put)
  .delete("/:diaryIdx", auth, validator(diarySchema.delete), diaryController.delete)
  .get("/userpage/:accountIdx/mine", validator(diarySchema.getUserpage), diaryController.getUserpage);

export default diaryRoute;
