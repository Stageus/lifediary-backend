import path from "path";
import fs from "fs";
import jwtVerify from "../utils/jwtVerify.js";
import writeLog from "../utils/writeCsv.js";

// process.on("uncaughtException", (err) => {});

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
        accountIdx: jwtVerify(req.headers.token).accountIdx,
        reqParams: JSON.stringify(req.params),
        reqBody: JSON.stringify(req.body),
        reqQuery: JSON.stringify(req.query),
        resMessage: body.message || null,
        resResult: body.result || null,
        log: body.stack,
        responseTime: (performance.now() - start).toFixed(2) + "ms",
        createdAt: new Date(),
      },
    ];

    await Promise.all([
      writeLog({ filePath: filePath.all, log: log }),
      res.statusCode.toString().startsWith("4") &&
        writeLog({ filePath: filePath.clientError, log: log }),
      res.statusCode.toString().startsWith("5") &&
        writeLog({ filePath: filePath.serverError, log: log }),
    ]);

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  return next();
};

export default logger;
