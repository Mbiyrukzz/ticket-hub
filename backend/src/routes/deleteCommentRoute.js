const { commentsCollection, usersCollection } = require('../db.js')
const fs = require('fs')
const path = require('path')

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

      // Log all comments to debug
      const allComments = await comments.find({}).toArray()
      console.log('All comments in DB:', allComments)

      // Find the comment - ensure we're using the correct field name
      const comment = await comments.findOne({
        id: commentId,
        ticketId: ticketId, // Adding ticketId to ensure we're deleting from correct ticket
      })

      if (!comment) {
        console.log('⚠️ Comment not found:', { ticketId, commentId })
        return res.status(404).json({ error: 'Comment not found' })
      }

      // Delete the comment
      const result = await comments.deleteOne({
        id: commentId,
        ticketId: ticketId,
      })

      if (result.deletedCount === 0) {
        return res.status(500).json({ error: 'Failed to delete comment' })
      }

      // Remove image file if it exists
      if (comment.imageUrl) {
        const imagePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(comment.imageUrl)
        )

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
          console.log('🗑️ Image file deleted:', imagePath)
        }
      }

      // Update user's comments array
      await users.updateOne(
        { id: comment.createdBy },
        { $pull: { comments: commentId } }
      )

      console.log('✅ Successfully deleted comment:', comment)
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
