import jwt from "../utils/jwt.js";
import sendError from "../utils/sendError.js";
import CONSTANTS from "../utils/constansts.js";

const permission = (req, res, next) => {
  try {
    if (!jwt.verify(req.headers.token)) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    const { permission } = jwt.verify(req.headers.token);
    if (permission !== "admin") {
      sendError({ status: 403, message: CONSTANTS.MSG[403] });
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default permission;
