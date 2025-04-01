const path = require('path')
const fs = require('fs')
const {
  commentsCollection,
  usersCollection,
  ticketsCollection,
} = require('../db.js')
const { userOwnComment } = require('../middleware/userOwnComment.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const logActivity = require('../middleware/logActivity.js')

const deleteCommentRoute = {
  path: '/tickets/:ticketId/comments/:commentId',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnComment],
  handler: async (req, res) => {
    try {
      const comments = commentsCollection()
      const users = usersCollection()
      const tickets = ticketsCollection()

      if (!comments || !users || !tickets) {
        console.log('⚠️ Database connection not initialized')
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      const { ticketId, commentId } = req.params
      const authUser = req.user
      const userId = authUser?.uid // Align with createCommentRoute (use uid instead of id)

      if (!userId) {
        console.log('⚠️ User ID not found in authUser:', authUser)
        return res.status(403).json({ error: 'User authentication failed' })
      }

      console.log('🔍 Delete Comment Request Details:', {
        userId,
        ticketId,
        commentId,
        timestamp: new Date().toISOString(),
      })

      const comment = await comments.findOne({
        id: commentId,
        ticketId: ticketId,
      })

      if (!comment) {
        console.log('⚠️ Comment not found:', { ticketId, commentId })
        return res.status(404).json({ error: 'Comment not found' })
      }

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        console.log('⚠️ Ticket not found:', { ticketId })
        return res.status(404).json({ error: 'Ticket not found' })
      }

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

      const session = comments.client.startSession()
      let userUpdateResult
      try {
        await session.withTransaction(async () => {
          const result = await comments.deleteOne({
            id: commentId,
            ticketId: ticketId,
          })

          if (result.deletedCount === 0) {
            console.log('⚠️ No comment was deleted:', { ticketId, commentId })
            throw new Error('Failed to delete comment')
          }
          console.log('✅ Comment deleted from collection')

          userUpdateResult = await users.updateOne(
            { id: comment.createdBy },
            { $pull: { comments: commentId } }
          )
          console.log('🔍 User update result:', userUpdateResult)

          const ticketUpdateResult = await tickets.updateOne(
            { id: ticketId },
            { $pull: { comments: commentId } }
          )
          console.log('🔍 Ticket update result:', ticketUpdateResult)

          if (ticketUpdateResult.modifiedCount === 0) {
            console.log(
              '⚠️ Failed to update ticket by removing comment reference:',
              { ticketId, commentId }
            )
          }

          await logActivity(
            'deleted-comment',
            `Deleted a comment from ticket #${ticketId}`,
            userId,
            ticketId
          )
          console.log('✅ Activity logged for deleted comment')
        })
      } finally {
        await session.endSession()
      }

      console.log('✅ Comment deleted successfully')
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
