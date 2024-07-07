import commentService from "../services/commentService.js";

const commentController = {
  get: async (req, res, next) => {
    try {
      const result = await commentService.getComments(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  post: async (req, res, next) => {
    try {
      const result = await commentService.post(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  postReply: async (req, res, next) => {
    try {
      const result = await commentService.postReply(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  put: async (req, res, next) => {
    try {
      const result = await commentService.update(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const result = await commentService.delete(req, res);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  },
};

export default commentController;
