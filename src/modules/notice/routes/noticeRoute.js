import express from "express";
import noticeController from "../controllers/noticeController.js";
import validator from "../../../shared/middlewares/validator.js";
import noticeSchema from "../schema/noticeSchema.js";

const noticeRoute = express.Router();

noticeRoute
  .get("/", validator(noticeSchema.get), noticeController.get)
  .get("/new", noticeController.getIsNew)
  .delete("/:noticeIdx", validator(noticeSchema.delete), noticeController.delete);

export default noticeRoute;
