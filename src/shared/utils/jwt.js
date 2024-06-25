import jsonwebtoken from "jsonwebtoken";
import jwtConfig from "../configs/jwtConfig.js";
import sendError from "./sendError.js";
import CONSTANTS from "./constansts.js";

const jwt = {
  sign: (obj) => {
    return jsonwebtoken.sign(obj, process.env.JWT_KEY, jwtConfig);
  },
  verify: (token) => {
    try {
      return !!token && jsonwebtoken.verify(token, process.env.JWT_KEY);
    } catch (err) {
      if (err.message === "jwt malformed") {
        sendError({ message: CONSTANTS.MSG[401], status: 401 });
      }
    }
  },
};

export default jwt;
