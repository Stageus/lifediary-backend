import accountService from "../services/accountService.js";

const accountController = {
  oauthGoogle: (req, res, next) => {
    try {
      const result = accountService.oauthGoogle(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  oauthGoogleRedirect: async (req, res, next) => {
    try {
      const result = await accountService.oauthGoogleRedirect(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const result = await accountService.get(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  post: async (req, res, next) => {
    try {
      const result = await accountService.post(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  putNickname: async (req, res, next) => {
    try {
      await accountService.putNickname(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  getNicknameDuplication: async (req, res, next) => {
    try {
      const result = await accountService.getNicknameDuplication(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  putProfileImg: async (req, res, next) => {
    try {
      await accountService.putProfileImg(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await accountService.delete(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

  getOtherAccount: async (req, res, next) => {
    try {
      const result = await accountService.getOtherAccount(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
};

export default accountController;
