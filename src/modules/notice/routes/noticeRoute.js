import express from "express";
import noticeController from "../controllers/noticeController.js";
import validator from "../../../shared/middlewares/validator.js";
import noticeSchema from "../schema/noticeSchema.js";

const noticeRoute = express.Router();

noticeRoute
  .get("/", validator(noticeSchema.selectNotices), noticeController.selectNotices)
  .get("/new", noticeController.selectIsNew)
  .delete("/:noticeIdx", validator(noticeSchema.delete), noticeController.delete);

export default noticeRoute;
