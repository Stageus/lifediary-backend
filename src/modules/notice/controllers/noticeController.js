import noticeService from "../services/noticeService.js";

const noticeController = {
  get: async (req, res, next) => {
    try {
      const result = await noticeService.get(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  getIsNew: async (req, res, next) => {
    try {
      const result = await noticeService.getIsNew(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const result = await noticeService.delete(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
};

export default noticeController;
