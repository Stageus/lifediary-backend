import jwt from "../utils/jwt.js";
import sendError from "../utils/sendError.js";
import CONSTANTS from "../utils/constansts.js";

const auth = (req, res, next) => {
  try {
    if (!jwt.verify(req.headers.token)) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    const { accountIdx } = jwt.verify(req.headers.token);
    if (!accountIdx) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default auth;
