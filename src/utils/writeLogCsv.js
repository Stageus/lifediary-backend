import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";

const writeLogCsv = async ({ filePath, log }) => {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "status", title: "STATUS" },
      { id: "method", title: "METHOD" },
      { id: "url", title: "URL" },
      { id: "accountIdx", title: "ACCOUNT_IDX" },
      { id: "reqParams", title: "REQ_PARAMS" },
      { id: "reqBody", title: "REQ_BODY" },
      { id: "reqQuery", title: "REQ_QUERY" },
      { id: "resMessage", title: "RES_MESSAGE" },
      { id: "responseTime", title: "RESPONSE_TIME" },
      { id: "createdAt", title: "CREATED_AT" },
      { id: "errStack", title: "LOG" },
    ],
    append: fs.existsSync(filePath),
  });

  await csvWriter.writeRecords(log);

  return;
};

export default writeLogCsv;
