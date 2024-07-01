import express from "express";
import diaryController from "../controllers/diaryController.js";

const diaryRoute = express.Router();

diaryRoute //
  .get("/home", diaryController.getHome)
  .get("/search", diaryController.getSearch)
  .get("/:diaryIdx", diaryController.getMainWithFirstData)
  .get("/", diaryController.getMain);
// .post("/", diaryController)
// .put("/:diaryIdx", diaryController)
// .delete("/:diaryIdx", diaryController)

export default diaryRoute;
