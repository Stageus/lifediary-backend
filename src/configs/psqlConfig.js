import dotenv from "dotenv";
dotenv.config();

const psqlConfig = {
  host: process.env.DB_PSQL_HOST,
  database: process.env.DB_PSQL_DB,
  user: process.env.DB_PSQL_USER,
  port: process.env.DB_PSQL_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export default psqlConfig;
