import commentModel from '../models/commentModel.js'
import jwtVerify from '../utils/jwtVerify.js'

const commentService = {
  insertComment: () => {},
  selectComments: async (req, res) => {
    const { page, diaryIdx } = req.query
    const { accountIdx } = jwtVerify(req.headers.token)

    const { rows } = await commentModel.selectList({
      diaryIdx: diaryIdx,
      accountIdx: accountIdx,
      page: page,
    })

    return rows
  },
  update: () => {},
  delete: () => {},
}

export default commentService
