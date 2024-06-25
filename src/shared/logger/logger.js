import { createObjectCsvWriter as csvWriter } from "csv-writer";
import path from "path";
import fs from "fs";
import jwt from "../utils/jwt.js";
import CONSTANTS from "../utils/constansts.js";

const logger = (req, res) => {
  try {
    const curDate = new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString().slice(0, 10);
    const curDir = path.dirname(new URL(import.meta.url).pathname);
    const logDir = path.join(curDir, `../../../logs/${curDate}/`);

    fs.mkdirSync(logDir, { recursive: true });

    let accountIdx;
    try {
      accountIdx = jwt.verify(req.headers.token).accountIdx;
    } catch (err) {
      if (err.status === 401) accountIdx = null;
    }

    const log = [
      {
        status: res.statusCode,
        method: req.method,
        url: req.baseUrl,
        accountIdx,
        reqParams: JSON.stringify(req.params),
        reqBody: JSON.stringify(req.body),
        reqQuery: JSON.stringify(req.query),
        resMessage: res.locals.modifiedBody.message,
        resResult: JSON.stringify(res.locals.modifiedBody.result),
        responseTime: res.locals.responseTime,
        createdAt: new Date(),
        errStack: res.locals.stack,
      },
    ];

    const statusCode = res.statusCode.toString();

    const allCsvPath = path.join(logDir, "all.csv");
    csvWriter({
      path: allCsvPath,
      header: CONSTANTS.LOG_HEADER,
      append: fs.existsSync(allCsvPath),
    }).writeRecords(log);

    if (statusCode.startsWith("4")) {
      const clientErrorCsvPath = path.join(logDir, "clientError.csv");
      csvWriter({
        path: clientErrorCsvPath,
        header: CONSTANTS.LOG_HEADER,
        append: fs.existsSync(clientErrorCsvPath),
      }).writeRecords(log);
    } //
    else if (statusCode.startsWith("5")) {
      const serverErrorCsvPath = path.join(logDir, "serverError.csv");
      csvWriter({
        path: serverErrorCsvPath,
        header: CONSTANTS.LOG_HEADER,
        append: fs.existsSync(serverErrorCsvPath),
      }).writeRecords(log);
    }

    return;
  } catch (err) {
    throw err;
  }
};

export default logger;
