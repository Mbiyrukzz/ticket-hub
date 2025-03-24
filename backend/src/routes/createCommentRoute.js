import { commentsCollection } from '../db.js'
import { v4 as uuidv4 } from 'uuid' // Import UUID

export const createCommentRoute = {
  path: '/tickets/:ticketId/comments',
  method: 'post',
  handler: async (req, res) => {
    try {
      if (!commentsCollection) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { ticketId } = req.params
      const { content, author } = req.body

      console.log('🔹 Incoming request to add comment:', {
        ticketId,
        content,
        author,
      })

      if (!ticketId || typeof ticketId !== 'string') {
        return res
          .status(400)
          .json({ error: 'ticketId is required and must be a string' })
      }

      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res
          .status(400)
          .json({ error: 'Comment content must be a non-empty string' })
      }

      const newComment = {
        id: uuidv4(), // Generate UUID for frontend
        ticketId,
        content: content.trim(),
        author: author || 'Anonymous',
        createdAt: new Date().toISOString(),
      }

      console.log('📝 Creating new comment:', newComment)

      const result = await commentsCollection.insertOne(newComment)

      if (!result.acknowledged) {
        console.error('❌ MongoDB insert failed')
        return res.status(500).json({ error: 'Failed to save comment' })
      }

      console.log('✅ Comment created:', {
        _id: result.insertedId,
        ...newComment,
      })

      res.status(201).json({ _id: result.insertedId, ...newComment })
    } catch (error) {
      console.error('❌ Error creating comment:', error.message, error.stack)
      res
        .status(500)
        .json({ error: 'Failed to create comment', details: error.message })
    }
  },
}
