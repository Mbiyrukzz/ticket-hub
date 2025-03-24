import { commentsCollection } from '../db.js'

export const updateCommentRoute = {
  path: '/tickets/:ticketId/comments/:commentId', // Use consistent parameter names
  method: 'put',
  handler: async (req, res) => {
    const { ticketId, commentId } = req.params
    let { content } = req.body

    try {
      if (!commentsCollection) {
        return res.status(500).json({ error: 'Database not initialized' })
      }

      if (!content || content.trim() === '') {
        console.log('⚠️ Content is required but received:', content)
        return res.status(400).json({ error: 'Content is required' })
      }

      console.log('🔎 Searching for comment with:', { ticketId, commentId })

      const filter = { id: commentId.trim(), ticketId: ticketId.trim() }
      const existingComment = await commentsCollection.findOne(filter)

      if (!existingComment) {
        console.log('⚠️ Comment not found for:', filter)
        return res.status(404).json({ error: 'Comment not found', filter })
      }

      const result = await commentsCollection.findOneAndUpdate(
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

      console.log('✅ Updated comment:', result)
      res.status(200).json(result)
    } catch (error) {
      console.error('❌ Error updating comment:', error)
      res
        .status(500)
        .json({ error: 'Failed to update comment', details: error.message })
    }
  },
}
