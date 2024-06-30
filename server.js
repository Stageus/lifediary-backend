import dotenv from "dotenv";
dotenv.config();

import express from "express";
import accountRoute from "./src/modules/account/routes/accountRoute.js";
import subscriptionRoute from "./src/modules/subscription/routes/subscriptionRoute.js";
import reportRoute from "./src/modules/report/routes/reportRoute.js";
import noticeRoute from "./src/modules/notice/routes/noticeRoute.js";
import diaryRoute from "./src/modules/diary/routes/diaryRoute.js";
import commentRoute from "./src/modules/comment/routes/commentRoute.js";
import authRoute from "./src/modules/auth/routes/authRoute.js";
import uncaughtExceptionLogger from "./src/shared/logger/uncaughtExceptionLogger.js";
import errorHandler from "./src/shared/middlewares/errorHandler.js";
import grassRoute from "./src/modules/grass/routes/grassRoute.js.js";
import exceptionHandler from "./src/shared/middlewares/exceptionHandler.js";
import interceptor from "./src/shared/middlewares/interceptor.js";

const server = express();
server.use(express.json());

server.use(interceptor);

server.use("/account", accountRoute);
server.use("/auth", authRoute);
server.use("/comment", commentRoute);
// server.use("/diary", diaryRoute);
server.use("/grass", grassRoute);
server.use("/notice", noticeRoute);
server.use("/report", reportRoute);
// server.use("/subscription", subscriptionRoute);
server.use("/", exceptionHandler);
server.use(errorHandler);

server.listen(8000, () => {
  console.log(`8000번 포트로 실행 중`);
});

process.on("uncaughtException", uncaughtExceptionLogger);
