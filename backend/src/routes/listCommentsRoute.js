import { commentsCollection } from '../db.js'

export const listCommentsRoute = {
  path: '/tickets/:ticketId/comments',
  method: 'get',
  handler: async (req, res) => {
    try {
      const { ticketId } = req.params
      const comments = await commentsCollection.find({ ticketId }).toArray()

      console.log('✅ Sending comments:', comments) // ✅ Debugging

      res.status(200).json(comments)
    } catch (error) {
      console.error('❌ Error fetching comments:', error)
      res.status(500).json({ error: 'Failed to fetch comments' })
    }
  },
}
