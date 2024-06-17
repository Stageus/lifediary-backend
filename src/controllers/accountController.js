import accountSchema from '../schema/accountSchema.js'
import accountService from '../services/accountService.js'
import sendError from '../utils/sendError.js'

const accountController = {
  post: [
    validator(accountSchema.post),
    (req, res) => {
      const data = accountService.signup(req, res)

      res.send(data)
    },
  ],
}

export default accountController
