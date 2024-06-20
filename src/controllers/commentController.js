import commentService from "../services/commentService.js";

const commentController = {
  get: async (req, res, next) => {
    try {
      const result = await commentService.selectComments(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
  post: async (req, res, next) => {
    try {
      const result = await commentService.insert(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
  postReply: async (req, res, next) => {
    try {
      const result = await commentService.insertReply(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
  put: async (req, res, next) => {
    try {
      const result = await commentService.update(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const result = await commentService.delete(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
};

export default commentController;
