import express from "express";
import validator from "../../../shared/middlewares/validator.js";
import reportSchema from "../schema/reportSchema.js";
import reportController from "../controllers/reportController.js";
import permission from "../../../shared/middlewares/permission.js";
import auth from "../../../shared/middlewares/auth.js";

const reportRoute = express.Router();

reportRoute
  .get("/", permission, validator(reportSchema.get), reportController.get)
  .get("/count", permission, reportController.getCnt)
  .get("/new", permission, reportController.getNew)
  .post("/", auth, validator(reportSchema.post), reportController.post)
  .put("/:reportIdx/status", permission, validator(reportSchema.putStatus), reportController.putStatus);

export default reportRoute;
