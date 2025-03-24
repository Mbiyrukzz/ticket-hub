import { commentsCollection } from '../db.js'

export const deleteCommentRoute = {
  path: '/tickets/:ticketId/comments/:commentId', // Fix typo
  method: 'delete',
  handler: async (req, res) => {
    try {
      const { ticketId, commentId } = req.params // Use correct param names
      console.log('🧐 Deleting comment with:', { ticketId, commentId })

      const filter = { id: commentId.trim(), ticketId: ticketId.trim() }
      const comment = await commentsCollection.findOne(filter)
      if (!comment) {
        console.log('⚠️ Comment not found for:', filter)
        return res.status(404).json({ error: 'Comment not found' })
      }

      await commentsCollection.deleteOne(filter)
      console.log('✅ Deleted comment with:', filter)
      res.status(204).send() // No content on success
    } catch (error) {
      console.error('❌ Error deleting comment:', error.message, error.stack)
      res
        .status(500)
        .json({ error: 'Failed to delete comment', details: error.message })
    }
  },
}
