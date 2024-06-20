import commentModel from '../models/commentModel.js'
import jwtVerify from '../utils/jwtVerify.js'
import sendError from '../utils/sendError.js'

const commentService = {
  selectComments: async (req, res) => {
    const { page, diaryIdx } = req.query
    const { accountIdx } = jwtVerify(req.headers.token)

    const result = await commentModel
      .selectList({
        diaryIdx: diaryIdx,
        accountIdx: accountIdx,
        page: page,
      })
      .catch(() => sendError({ status: 500, message: 'smaple' }))

    if (result.rowCount === 0) sendError({ status: 404, message: 'sample' })

    return result.rows
  },
  insert: async (req, res) => {
    const { diaryIdx } = req.query
    const { textContent } = req.body
    const { accountIdx } = jwtVerify(req.headers.token)

    const result = await commentModel
      .insert({
        diaryIdx: diaryIdx,
        accountIdx: accountIdx,
        textContent: textContent,
      })
      .catch(() => sendError({ status: 500, message: 'smaple' }))

    if (result.rowCount === 0) sendError({ status: 404, message: 'sample' })

    return result.rows
  },
  insertReply: async (req, res) => {
    const { parentCommentIdx } = req.params
    const { textContent } = req.body
    const { accountIdx } = jwtVerify(req.headers.token)

    const check = await commentModel
      .selectDiaryOwnerIdx({
        parentCommentIdx: parentCommentIdx,
      })
      .catch(() => sendError({ status: 500, message: 'smaple' }))

    if (check.rows[0].accountIdx !== accountIdx)
      sendError({ status: 403, message: 'sample' })

    const result = await commentModel
      .insertReply({
        accountIdx: accountIdx,
        textContent: textContent,
        parentCommentIdx: parentCommentIdx,
      })
      .catch(() => sendError({ status: 500, message: 'smaple' }))

    if (result.rowCount === 0) sendError({ status: 404, message: 'sample' })

    return result.rows
  },
  update: async (req, res) => {
    const { commentIdx } = req.params
    const { textContent } = req.body
    const { accountIdx } = jwtVerify(req.headers.token)

    const check = await commentModel
      .selectCommentOwnerIdx({
        commentIdx: commentIdx,
      })
      .catch(() => sendError({ status: 500, message: 'smaple' }))

    if (check.rowCount === 0) sendError({ status: 404, message: 'sample' })
    if (check.rows[0].accountIdx !== accountIdx)
      sendError({ status: 403, message: 'sample' })

    const result = await commentModel
      .update({
        commentIdx: commentIdx,
        accountIdx: accountIdx,
        textContent: textContent,
      })
      .catch(() => sendError({ status: 500, message: 'smaple' }))

    return result.rows
  },
  delete: () => {},
}

export default commentService
