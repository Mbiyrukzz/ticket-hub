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
      console.error('Invalid authUser:', authUser)
      return res.status(401).json({ error: 'Invalid user authentication' })
    }

    try {
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      const users = usersCollection() // 👈 Add users collection

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        console.error(`Ticket not found: ${ticketId}`)
        return res.status(404).json({ error: 'Ticket not found' })
      }

      const normalizedAuthEmail = authUser.email.trim().toLowerCase()
      const isOwner = ticket.userId === authUser.uid

      const isShared =
        ticket.sharedWith && Array.isArray(ticket.sharedWith)
          ? ticket.sharedWith.some((user) => {
              if (!user || typeof user !== 'object' || !user.email) {
                console.warn('Invalid sharedWith user:', user)
                return false
              }
              const sharedEmail = user.email.trim().toLowerCase()
              const matches = sharedEmail === normalizedAuthEmail
              console.log(
                `Comparing sharedEmail: '${sharedEmail}' with authEmail: '${normalizedAuthEmail}' -> matches: ${matches}`
              )
              return matches
            })
          : false

      console.log('=== Access Debug ===')
      console.log('Auth UID:', authUser.uid)
      console.log('Auth Email:', normalizedAuthEmail)
      console.log('Ticket Owner UID:', ticket.userId)
      console.log('Shared With:', ticket.sharedWith)
      console.log('isOwner:', isOwner, '| isShared:', isShared)

      if (!isOwner && !isShared) {
        return res.status(403).json({
          error: 'Unauthorized to view comments for this ticket',
        })
      }

      const ticketComments = await comments
        .find({ ticketId })
        .sort({ createdAt: 1 })
        .toArray()

      // Fetch user info for all unique userIds in the comments
      const userIds = [
        ...new Set(ticketComments.map((comment) => comment.userId)),
      ]
      const usersList = await users.find({ id: { $in: userIds } }).toArray()

      const userMap = usersList.reduce((acc, user) => {
        acc[user.id] = user.name || user.userName || 'Unknown User'
        return acc
      }, {})

      const commentsWithUserNames = ticketComments.map((comment) => ({
        ...comment,
        userName: userMap[comment.userId] || 'Unknown User',
      }))

      console.log(`✅ Returning ${commentsWithUserNames.length} comments`)
      return res.status(200).json({ comments: commentsWithUserNames })
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { listCommentsRoute }
