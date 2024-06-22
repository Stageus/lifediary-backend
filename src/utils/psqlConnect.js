import pg from "pg";
import psqlConfig from "../configs/psqlConfig.js";
import sendError from "./sendError.js";
import CONSTANTS from "./constansts.js";

const psqlPool = new pg.Pool(psqlConfig);

const psqlConnect = {
  query: async ({ sql, values }) => {
    try {
      return await psqlPool.query(sql, values);
    } catch (err) {
      sendError({ status: 500, message: CONSTANTS.MSG[500], stack: err.stack });
    }
  },
  transaction: async (queries) => {
    let poolClient;
    try {
      poolClient = await psqlPool.connect();
      await poolClient.query("BEGIN");

      for (const query of queries) {
        await poolClient.query(query.sql, query.values);
      }

      return await poolClient.query("COMMIT");
    } catch (err) {
      await poolClient.query("ROLLBACK");
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    } finally {
      if (poolClient) poolClient.release();
    }
  },
};

export default psqlConnect;
