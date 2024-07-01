import express from "express";
import diaryController from "../controllers/diaryController.js";
import upload from "../../../shared/middlewares/upload.js";

const diaryRoute = express.Router();

diaryRoute //
  .get("/home", diaryController.getHome)
  .get("/search", diaryController.getSearch)
  .get("/:diaryIdx", diaryController.getMainWithFirstData)
  .get("/", diaryController.getMain)
  .post("/", upload.array("imgContents"), diaryController.post)
  .put("/:diaryIdx", upload.array("imgContents"), diaryController.put)
  .delete("/:diaryIdx", diaryController.delete);

export default diaryRoute;
