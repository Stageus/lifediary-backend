import noticeService from "../services/noticeService.js";

const noticeController = {
  selectNotices: async (req, res, next) => {
    try {
      const result = await noticeService.selectNotices(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  selectIsNew: async (req, res, next) => {
    try {
      const result = await noticeService.selectIsNew(req, res);
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
