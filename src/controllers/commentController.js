import commentService from '../services/commentService.js'

const commentController = {
  get: async (req, res) => {
    const result = await commentService.selectComments(req, res)

    res.send(result)
  },
  //
  post: (req, res) => {},
  //
  postReply: (req, res) => {},
  //
  put: (req, res) => {},
  //
  delete: (req, res) => {},
}

export default commentController
