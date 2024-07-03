import express from "express";
import subscriptionSchema from "../schema/subscriptionSchema.js";
import validator from "../../../shared/middlewares/validator.js";
import subscriptionController from "../controllers/subscriptionController.js";
import auth from "../../../shared/middlewares/auth.js";

const subscriptionRoute = express.Router();

subscriptionRoute
  .get("/", auth, validator(subscriptionSchema.get), subscriptionController.get)
  .post("/:toAccountIdx", auth, validator(subscriptionSchema.post), subscriptionController.post);

export default subscriptionRoute;
