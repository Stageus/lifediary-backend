import express from "express";
import subscriptionSchema from "../schema/subscriptionSchema.js";
import validator from "../../../shared/middlewares/validator.js";
import subscriptionController from "../controllers/subscriptionController.js";

const subscriptionRoute = express.Router();

subscriptionRoute
  .get("/", validator(subscriptionSchema.get), subscriptionController.get)
  .post("/:toaccountidx", validator(subscriptionSchema.post), subscriptionController.post);

export default subscriptionRoute;
