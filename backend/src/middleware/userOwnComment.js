const { commentsCollection } = require('../db.js')

const userOwnComment = async (req, res, next) => {
  try {
    const authUser = req.user // ✅ Extract user from request
    const { commentId } = req.params
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const comments = commentsCollection()
    const comment = await comments.findOne({ id: commentId })

    if (!comment) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    if (comment.createdBy !== authUser.uid) {
      return res.sendStatus(403) // Forbidden
    }

    next() // ✅ User is authorized, proceed to next middleware or route
  } catch (error) {
    console.error('❌ Error in userOwnComment middleware:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { userOwnComment }
