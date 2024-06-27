import grassService from "../services/grassService.js";

const grassController = {
  get: async (req, res, next) => {
    try {
      const result = await grassService.selectComments(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
};

export default grassController;
