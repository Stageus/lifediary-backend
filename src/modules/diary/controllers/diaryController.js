import diaryService from "../services/diaryService.js";

const diaryController = {
  getMainWithFirstData: async (req, res, next) => {
    try {
      const result = await diaryService.getMainWithFirstData(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  getMain: async (req, res, next) => {
    try {
      const result = await diaryService.getMain(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  getSearch: async (req, res, next) => {
    try {
      const result = await diaryService.getSearch(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  getHome: async (req, res, next) => {
    try {
      const result = await diaryService.getHome(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  post: async (req, res, next) => {
    try {
      const result = await diaryService.post(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  put: async (req, res, next) => {
    try {
      const result = await diaryService.put(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const result = await diaryService.delete(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  postLike: async (req, res, next) => {
    try {
      const result = await diaryService.postLike(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
};

export default diaryController;
