import express from "express";
import grassController from "../controllers/grassController.js";
import grassSchema from "../schema/grassSchema.js";
import validator from "../../../shared/middlewares/validator.js";
import auth from "../../../shared/middlewares/auth.js";

const grassRoute = express.Router();

grassRoute //
  .get("/", auth, validator(grassSchema.get), grassController.get);

export default grassRoute;
