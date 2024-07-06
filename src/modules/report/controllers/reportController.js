import reportService from "../services/reportService.js";

const reportController = {
  get: async (req, res, next) => {
    try {
      const result = await reportService.get(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  getNew: async (req, res, next) => {
    try {
      const result = await reportService.getNew(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  post: async (req, res, next) => {
    try {
      await reportService.post(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  putStatus: async (req, res, next) => {
    try {
      await reportService.putStatus(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
};

export default reportController;
