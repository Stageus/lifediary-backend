import reportService from "../services/reportService";

const reportController = {
  get: async (req, res, next) => {
    try {
      const result = await reportService.get(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
};

export default reportController;
