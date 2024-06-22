import path from "path";
import fs from "fs";
import writeLogCsv from "../utils/writeLogCsv.js";
import jwt from "../utils/jwt.js";

const logger = (req, res, next) => {
  const originalSend = res.send;
  const start = performance.now();

  res.send = async function (body) {
    const dirname = path.dirname(new URL(import.meta.url).pathname);
    const curDate = new Date().toISOString().slice(0, 10);
    const logDir = path.join(dirname, `../../logs/${curDate}`);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const filePath = {
      all: path.join(logDir, `all.csv`),
      clientError: path.join(logDir, `clientError.csv`),
      serverError: path.join(logDir, `serverError.csv`),
    };

    const log = [
      {
        status: res.statusCode,
        method: req.method,
        url: req.url,
        accountIdx: jwt.verify(req.headers.token).accountIdx,
        reqParams: JSON.stringify(req.params),
        reqBody: JSON.stringify(req.body),
        reqQuery: JSON.stringify(req.query),
        resMessage: body && body.message,
        resResult: body && body.result,
        responseTime: (performance.now() - start).toFixed(2) + "ms",
        createdAt: new Date(),
        errStack: body && body.stack,
      },
    ];

    await Promise.all([
      writeLogCsv({ filePath: filePath.all, log: log }),
      res.statusCode.toString().startsWith("4") && writeLogCsv({ filePath: filePath.clientError, log: log }),
      res.statusCode.toString().startsWith("5") && writeLogCsv({ filePath: filePath.serverError, log: log }),
    ]);

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  return next();
};

export default logger;
