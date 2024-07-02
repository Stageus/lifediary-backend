import express from "express";
import validator from "../../../shared/middlewares/validator.js";
import reportSchema from "../schema/reportSchema.js";
import reportController from "../controllers/reportController.js";
// import permission from "../../../shared/middlewares/permission.js";
import auth from "../../../shared/middlewares/auth.js";

const reportRoute = express.Router();

reportRoute
  .get("/", validator(reportSchema.get), reportController.get)
  .get("/count", reportController.getCnt)
  .get("/new", reportController.getNew)
  .post("/", auth, validator(reportSchema.post), reportController.post)
  .put("/:reportIdx/status", validator(reportSchema.putStatus), reportController.putStatus);

export default reportRoute;
