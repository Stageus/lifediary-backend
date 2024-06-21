import path from "path";
import fs from "fs";
import writeLog from "../utils/writeCsv.js";

const terminationLogger = async (err) => {
  const dirname = path.dirname(new URL(import.meta.url).pathname);
  const curDate = new Date().toISOString().slice(0, 10);
  const logDir = path.join(dirname, `../../logs/${curDate}`);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const serverErrorfilePath = path.join(logDir, `serverError.csv`);

  const log = [
    {
      status: 500,
      resMessage: err.message || null,
      resResult: err.result || null,
      createdAt: new Date(),
      errStack: err.stack,
    },
  ];

  await writeLog({ filePath: serverErrorfilePath, log: log });

  process.exit(1);
};

export default terminationLogger;
