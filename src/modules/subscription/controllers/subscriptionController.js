import subscriptionService from "../services/subscriptionService.js";

const subscriptionController = {
  get: async (req, res, next) => {
    try {
      const result = await subscriptionService.get(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  post: async (req, res, next) => {
    try {
      await subscriptionService.post(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
};

export default subscriptionController;
