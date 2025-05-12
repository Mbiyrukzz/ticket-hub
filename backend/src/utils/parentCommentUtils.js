const { ObjectId } = require('mongodb')
const { commentsCollection, repliesCollection } = require('../db')

const validateParentComment = async (parentCommentId, parentReplyId) => {
  if (!parentCommentId && !parentReplyId) return true // Top-level comment
  if (parentCommentId) {
    const comment = await (
      await commentsCollection()
    ).findOne({
      _id: new ObjectId(parentCommentId),
    })
    if (!comment) throw new Error('Parent comment not found')
  }
  if (parentReplyId) {
    const reply = await (
      await repliesCollection()
    ).findOne({
      _id: new ObjectId(parentReplyId),
    })
    if (!reply) throw new Error('Parent reply not found')
  }
  return true
}

module.exports = { validateParentComment }
