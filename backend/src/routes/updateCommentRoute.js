const { commentsCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnComment } = require('../middleware/userOwnComment.js')

const updateCommentRoute = {
  path: '/tickets/:ticketId/comments/:commentId',
  method: 'put',
  middleware: [verifyAuthToken, userOwnComment], // Added middleware
  handler: async (req, res) => {
    try {
      const comments = commentsCollection()
      if (!comments) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { ticketId, commentId } = req.params
      const userId = req.user?.id // Assuming verifyAuthToken sets req.user
      let { content } = req.body

      // Log request details
      console.log('🔍 Update Request Details:', {
        userId,
        ticketId,
        commentId,
        timestamp: new Date().toISOString(),
      })

      // Validate content
      if (!content || content.trim() === '') {
        console.log('⚠️ Content is required but received:', content)
        return res.status(400).json({ error: 'Content is required' })
      }

      // Find the comment
      const filter = { id: commentId.trim(), ticketId: ticketId.trim() }
      const existingComment = await comments.findOne(filter)

      if (!existingComment) {
        console.log('⚠️ Comment not found:', filter)
        return res.status(404).json({ error: 'Comment not found', filter })
      }

      // Update the comment
      const result = await comments.findOneAndUpdate(
        filter,
        {
          $set: {
            content: content.trim(),
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: 'after' } // Ensure MongoDB returns the updated document
      )

      if (!result) {
        console.log('⚠️ Update failed, no document returned:', filter)
        return res.status(500).json({ error: 'Comment update failed' })
      }

      console.log('✅ Comment updated successfully:', result)
      res.status(200).json({
        message: '✅ Comment updated successfully',
        commentId,
        updatedComment: result,
      })
    } catch (error) {
      console.error('❌ Error in update comment route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to update comment',
        details: error.message,
      })
    }
  },
}

module.exports = { updateCommentRoute }
