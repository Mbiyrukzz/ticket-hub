const { commentsCollection, usersCollection } = require('../db.js')

const listCommentsRoute = {
  path: '/users/:userId/:ticketId/comments',
  method: 'get',
  handler: async (req, res) => {
    try {
      const { userId } = req.params
      const users = usersCollection()
      const comments = commentsCollection()

      if (!users || !comments) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      // Fetch the user
      const user = await users.findOne({ id: userId })
      if (!user || !user.comments || user.comments.length === 0) {
        console.log('⚠️ No comments found for userId:', userId)
        return res.status(404).json({ error: 'User or comments not found' })
      }

      // Fetch comments using Promise.all()
      const commentList = await Promise.all(
        user.comments.map(async (commentId) => {
          return comments.findOne({ id: commentId })
        })
      )

      // Filter out null values (if comments were not found)
      const filteredComments = commentList.filter((comment) => comment !== null)

      console.log('✅ Sending comments:', filteredComments)
      res.status(200).json(filteredComments)
    } catch (error) {
      console.error('❌ Error fetching comments:', error)
      res.status(500).json({ error: 'Failed to fetch comments' })
    }
  },
}

module.exports = { listCommentsRoute }
