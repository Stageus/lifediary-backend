import express from "express";
import grassController from "../controllers/grassController.js";

const grassRoute = express.Router();

grassRoute //
  .get("/", grassController.get);

export default grassRoute;
