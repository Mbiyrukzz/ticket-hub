const { commentsCollection, ticketsCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const listCommentsRoute = {
  path: '/users/:userId/tickets/:ticketId/comments',
  method: 'get',
  middleware: [verifyAuthToken], // Add authentication
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const { userId, ticketId } = req.params

      // Validate authentication
      if (!authUser || authUser.uid !== userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Database connections
      const comments = commentsCollection()
      const tickets = ticketsCollection()
      if (!comments || !tickets) {
        throw new Error('Database connection not initialized')
      }

      // Verify ticket exists and belongs to user
      const ticket = await tickets.findOne({ id: ticketId, createdBy: userId })
      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found or you don't have permission",
        })
      }

      // Fetch comments for the given ticketId
      const commentList = await comments.find({ ticketId }).toArray()

      if (!commentList || commentList.length === 0) {
        console.log('⚠️ No comments found for ticketId:', ticketId)
        return res.status(200).json([]) // Return empty array instead of 404
      }

      // Convert createdAt to ISO string if needed (for consistency with create)
      const formattedComments = commentList.map((comment) => ({
        ...comment,
        _id: comment._id.toString(), // Convert ObjectId to string
        createdAt: new Date(comment.createdAt).toISOString(),
      }))

      console.log('✅ Sending comments:', formattedComments)
      res.status(200).json(formattedComments)
    } catch (error) {
      console.error('❌ Error fetching comments:', error.stack)
      res.status(error.status || 500).json({
        error: 'Failed to fetch comments',
        details: error.message,
      })
    }
  },
}

module.exports = { listCommentsRoute }
