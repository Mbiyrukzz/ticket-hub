const {
  commentsCollection,
  ticketsCollection,
  usersCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const listCommentsRoute = {
  path: '/tickets/:ticketId/comments',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const { ticketId } = req.params
    const authUser = req.user

    if (!authUser?.uid || !authUser?.email) {
      return res.status(401).json({ error: 'Invalid user authentication' })
    }

    try {
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      const users = usersCollection()

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      const currentUser = await users.findOne({ id: authUser.uid })
      const isAdmin = currentUser?.isAdmin === true
      const normalizedEmail = authUser.email.trim().toLowerCase()

      const isOwner = ticket.userId === authUser.uid
      const isShared = (ticket.sharedWith || []).some(
        (u) => u.email?.trim().toLowerCase() === normalizedEmail
      )

      // Only allow access if user is owner, shared, or admin
      if (!isOwner && !isShared && !isAdmin) {
        return res.status(403).json({
          error: 'Unauthorized to view comments for this ticket',
        })
      }

      const ticketComments = await comments
        .find({ ticketId })
        .sort({ createdAt: 1 })
        .toArray()

      const userIds = [...new Set(ticketComments.map((c) => c.userId))]
      const usersList = await users.find({ id: { $in: userIds } }).toArray()

      const userMap = usersList.reduce((acc, user) => {
        acc[user.id] = {
          name: user.name || user.userName || 'Unknown User',
          isAdmin: user.isAdmin === true,
        }
        return acc
      }, {})
      console.log('Fetched Comments:', ticketComments.length)
      console.log('Fetched Users:', usersList.length)
      console.log('userIds:', userIds)

      const commentsWithUserMeta = ticketComments.map((comment) => ({
        ...comment,
        userName: userMap[comment.userId]?.name || 'Unknown User',
        isAdmin: userMap[comment.userId]?.isAdmin || false,
      }))

      return res.status(200).json({ comments: commentsWithUserMeta })
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { listCommentsRoute }
