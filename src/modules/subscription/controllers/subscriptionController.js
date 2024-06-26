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
};

export default subscriptionController;
