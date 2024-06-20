import jwtConfig from "../configs/jwtConfig";
import jwt from "jsonwebtoken";

const jwtSign = (obj) => {
  return jwt.sign(obj, process.env.JWT_KEY, jwtConfig);
};

export default jwtSign;
