import { checkSchema } from "express-validator";
import sendError from "../utils/sendError.js";
import CONSTANTS from "../utils/constansts.js";

const validator = (schema) => async (req, res, next) => {
  try {
    const errors = (await checkSchema(schema).run(req)).reduce((prev, curElement) => {
      return prev.concat([...curElement.errors]);
    }, []);

    if (errors.length > 0) {
      return sendError({ status: 400, message: CONSTANTS.MSG[400] });
    }
    return next();
  } catch (err) {
    next(err);
  }
};

export default validator;
