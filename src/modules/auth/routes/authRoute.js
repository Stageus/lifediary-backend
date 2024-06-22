import express from "express";

const authRoute = express.Router();

authRoute.get("/auth");

export default authRoute;
