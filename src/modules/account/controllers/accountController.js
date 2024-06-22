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
};

export default accountController;
