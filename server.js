import dotenv from "dotenv";
dotenv.config();

import express from "express";
import api from "./src/api/api.js";
import logger from "./src/logger/logger.js";
import terminationLogger from "./src/logger/terminationLogger.js";

const server = express();

server.use(logger);

server.use(express.json());
server.use("/", api);

server.listen(8000, () => {
  console.log(`8000번 포트로 실행 중`);
});

process.on("uncaughtException", terminationLogger);
