const { commentsCollection } = require('../db.js')

const listCommentsRoute = {
  path: '/tickets/:ticketId/comments', // More logical URL
  method: 'get',
  handler: async (req, res) => {
    try {
      const { ticketId } = req.params
      const comments = commentsCollection()

      if (!comments) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      // Fetch comments for the given ticketId
      const commentList = await comments.find({ ticketId }).toArray()

      if (!commentList || commentList.length === 0) {
        console.log('⚠️ No comments found for ticketId:', ticketId)
        return res
          .status(404)
          .json({ error: 'No comments found for this ticket' })
      }

      console.log('✅ Sending comments:', commentList)
      res.status(200).json(commentList)
    } catch (error) {
      console.error('❌ Error fetching comments:', error)
      res.status(500).json({ error: 'Failed to fetch comments' })
    }
  },
}

module.exports = { listCommentsRoute }
