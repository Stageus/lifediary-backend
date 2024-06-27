import { createObjectCsvWriter as csvWriter } from "csv-writer";
import path from "path";
import fs from "fs";
import CONSTANTS from "../utils/constansts.js";

const uncaughtExceptionLogger = (err) => {
  try {
    console.error("uncaughtException : \n", err);

    const curDate = new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString().slice(0, 10);
    const curDir = path.dirname(new URL(import.meta.url).pathname);
    const logDir = path.join(curDir, `../../../logs/${curDate}/`);

    fs.mkdirSync(logDir, { recursive: true });

    const log = [{ status: 500, resMessage: err.message || null, createdAt: new Date(), errStack: err.stack }];

    const serverErrorCsvPath = path.join(logDir, "serverError.csv");
    csvWriter({
      path: serverErrorCsvPath,
      header: CONSTANTS.LOG_HEADER,
      append: fs.existsSync(serverErrorCsvPath),
    }).writeRecords(log);

    return;
  } catch (err) {
    console.error("logging fail : \n", err);
  }
};

export default uncaughtExceptionLogger;
