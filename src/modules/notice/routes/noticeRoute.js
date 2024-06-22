import express from "express";
import noticeController from "../controllers/noticeController.js";

const noticeRoute = express.Router();

noticeRoute
  .get("/", noticeController.selectNotices)
  .get("/new", noticeController.selectIsNew)
  .delete("/:noticeIdx", noticeController.delete);

export default noticeRoute;
