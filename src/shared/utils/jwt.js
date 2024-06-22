import jsonwebtoken from "jsonwebtoken";
import jwtConfig from "../configs/jwtConfig.js";

const jwt = {
  sign: (obj) => {
    return jsonwebtoken.sign(obj, process.env.JWT_KEY, jwtConfig);
  },
  verify: (token) => {
    return !!token && jsonwebtoken.verify(token, process.env.JWT_KEY);
  },
};

export default jwt;
