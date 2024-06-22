import express from "express";
import authController from "../controllers/authController.js";

const authRoute = express.Router();

authRoute.get("/", authController.getAuth);

export default authRoute;
