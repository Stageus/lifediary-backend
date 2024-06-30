import express from "express";
import validator from "../../../shared/middlewares/validator.js";
import reportSchema from "../schema/reportSchema.js";
import reportController from "../controllers/reportController.js";
// import permission from "../../../shared/middlewares/permission.js";

const reportRoute = express.Router();

reportRoute.get("/", validator(reportSchema.get), reportController.get);
// .get("/report/new", reportController)
// .post("/report", reportController)
// .put("/report/:reportIdx/status", reportController);

export default reportRoute;
