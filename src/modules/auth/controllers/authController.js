import authService from "../services/authService.js";

const authController = {
  getAuth: async (req, res, next) => {
    try {
      const result = authService.getTokenInfo(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
