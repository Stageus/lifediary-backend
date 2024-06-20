import express from "express";
import dotenv from "dotenv";
import api from "./src/api/api.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/", api);

app.listen(8000, () => {});
