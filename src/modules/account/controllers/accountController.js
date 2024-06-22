import accountService from "../services/accountService.js";

const accountController = {
  getRedirectUrl: (req, res) => {
    try {
      const result = accountService.getRedirectUrl(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  getIsAccountExist: (req, res) => {
    try {
      const result = accountService.selectOauthGoogleId(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  getAuth: async (req, res) => {
    try {
      const result = accountService.getTokenInfo(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res) => {
    try {
      const result = await accountService.selectIdx(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  signup: async (req, res) => {
    try {
      const result = await accountService.insertAccount(req, res);
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },

  updateNickname: async (req, res) => {
    try {
      await accountService.updateNickname(req, res);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
};

export default accountController;
