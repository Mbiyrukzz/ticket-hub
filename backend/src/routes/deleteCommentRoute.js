const path = require('path')
const fs = require('fs')

const { commentsCollection, usersCollection } = require('../db.js')
const { userOwnComment } = require('../middleware/userOwnComment.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const deleteCommentRoute = {
  path: '/tickets/:ticketId/comments/:commentId',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnComment], // Fixed middleware order
  handler: async (req, res) => {
    try {
      const comments = commentsCollection()
      const users = usersCollection()

      if (!comments || !users) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { ticketId, commentId } = req.params
      const userId = req.user?.id // Assuming verifyAuthToken sets req.user
      console.log('🔍 Delete Request Details:', {
        userId, // Added userId to the log
        ticketId,
        commentId,
        timestamp: new Date().toISOString(),
      })

      // ✅ Fetch the comment first
      const comment = await comments.findOne({
        id: commentId,
        ticketId: ticketId,
      })

      if (!comment) {
        console.log('⚠️ Comment not found:', { ticketId, commentId })
        return res.status(404).json({ error: 'Comment not found' })
      }

      // ✅ Delete image if exists
      if (comment.imageUrl) {
        const imagePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(comment.imageUrl)
        )
        console.log('🛠️ Attempting image deletion:', imagePath)
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
            console.log('🗑️ Image deleted successfully')
          } else {
            console.log('⚠️ Image file not found at:', imagePath)
          }
        } catch (imageError) {
          console.error('⚠️ Error deleting image:', imageError)
        }
      }

      // ✅ Delete the comment from the collection
      const result = await comments.deleteOne({
        id: commentId,
        ticketId: ticketId,
      })

      if (result.deletedCount === 0) {
        console.log('⚠️ No comment was deleted:', { ticketId, commentId })
        return res.status(500).json({ error: 'Failed to delete comment' })
      }
      console.log('✅ Comment deleted from collection')

      // ✅ Remove comment reference from user
      const userUpdateResult = await users.updateOne(
        { id: comment.createdBy },
        { $pull: { comments: commentId } }
      )

      res.status(200).json({
        message: '✅ Comment deleted successfully',
        commentId,
        userUpdated: userUpdateResult.modifiedCount > 0,
      })
    } catch (error) {
      console.error('❌ Error in delete comment route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to delete comment',
        details: error.message,
      })
    }
  },
}

module.exports = { deleteCommentRoute }
