const { commentsCollection, usersCollection } = require('../db.js')

const deleteCommentRoute = {
  path: '/tickets/:ticketId/comments/:commentId',
  method: 'delete',
  handler: async (req, res) => {
    try {
      const comments = commentsCollection()
      const users = usersCollection()

      if (!comments || !users) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { ticketId, commentId } = req.params
      console.log('🧐 Attempting to delete comment:', { ticketId, commentId })

      // Find the comment
      const comment = await comments.findOne({ id: commentId, ticketId })
      if (!comment) {
        console.log('⚠️ Comment not found:', { ticketId, commentId })
        return res.status(404).json({ error: 'Comment not found' })
      }

      // Delete the comment from the comments collection
      const result = await comments.findOneAndDelete({
        id: commentId,
        ticketId,
      })
      const deletedComment = result.value

      if (!deletedComment) {
        console.log('⚠️ Comment was not found in database after delete attempt')
        return res.status(404).json({ error: 'Comment not found' })
      }

      // Remove the comment from the user's comments array
      await users.updateOne(
        { id: deletedComment.createdBy },
        { $pull: { comments: { id: commentId } } } // Ensure correct structure
      )

      console.log('✅ Successfully deleted comment:', deletedComment)
      res
        .status(200)
        .json({ message: 'Comment deleted successfully', id: commentId })
    } catch (error) {
      console.error('❌ Error deleting comment:', error)
      res
        .status(500)
        .json({ error: 'Failed to delete comment', details: error.message })
    }
  },
}

module.exports = { deleteCommentRoute }
