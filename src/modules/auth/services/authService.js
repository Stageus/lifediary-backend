import CONSTANTS from "../../../shared/utils/constansts.js";
import jwt from "../../../shared/utils/jwt.js";

const authService = {
  getTokenInfo: (req, res) => {
    const result = jwt.verify(req.headers.token);

    if (!result) {
      sendError({ status: 401, message: CONSTANTS.MSG[401] });
    }

    return result;
  },
};

export default authService;
