import express from "express";
import validator from "../../../shared/middlewares/validator.js";
import reportSchema from "../schema/reportSchema.js";
import reportController from "../controllers/reportController.js";
import permission from "../../../shared/middlewares/permission.js";
import auth from "../../../shared/middlewares/auth.js";
import CONSTANTS from "../../../shared/utils/constansts.js";

const reportRoute = express.Router();

reportRoute
  .get("/", permission(CONSTANTS.ALLOWED_PERMISSION), validator(reportSchema.get), reportController.get)
  .get("/new", permission(CONSTANTS.ALLOWED_PERMISSION), reportController.getNew)
  .post("/", auth, validator(reportSchema.post), reportController.post)
  .put(
    "/:reportIdx/status",
    permission(CONSTANTS.ALLOWED_PERMISSION),
    validator(reportSchema.putStatus),
    reportController.putStatus
  );

export default reportRoute;
