import jwt from "../utils/jwt.js";
import sendError from "../utils/sendError.js";
import CONSTANTS from "../utils/constansts.js";

const auth = (req, res, next) => {
  try {
    const { accountIdx } = jwt.verify(req.headers.token);
    // if (!jwt.verify(req.headers.token)) {
    //   sendError({ status: 401, message: CONSTANTS.MSG[401] });
    // }
    next();
  } catch (err) {
    // console.log("ss");
    // if (err.name === "JsonWebTokenError") {
    //   return res.status(401).json({ message: "Invalid token." });
    // }
    next(err);
  }
};

export default auth;
