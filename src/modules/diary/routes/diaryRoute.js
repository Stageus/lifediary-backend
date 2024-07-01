import express from "express";
import diaryController from "../controllers/diaryController.js";

const diaryRoute = express.Router();

diaryRoute //
  .get("/", diaryController.getMain)
  .get("/:diaryIdx", diaryController.getMainWithFirstData);
// .get("/search", diaryController)
// .get("/home", diaryController)
// .get("/mypage/mine", diaryController)
// .get("/mypage/like", diaryController)
// .get("/userpage/:accountIdx/mine", diaryController)
// .post("/", diaryController)
// .put("/:diaryIdx", diaryController)
// .delete("/:diaryIdx", diaryController)
// .post("/:diaryIdx/like", diaryController);

export default diaryRoute;
