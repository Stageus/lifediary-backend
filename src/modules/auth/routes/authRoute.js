import express from "express";
import authController from "../controllers/authController.js";
import auth from "../../../shared/middlewares/auth.js";

const authRoute = express.Router();

authRoute.get("/", auth, authController.getAuth);

export default authRoute;
