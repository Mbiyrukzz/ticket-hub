const {
  ticketsCollection,
  usersCollection,
  commentsCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const ticketslistRoutes = {
  path: '/users/:userId/tickets',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const { userId } = req.params
    const authUser = req.user

    try {
      if (authUser.uid !== userId) {
        console.error('❌ Forbidden - User ID mismatch')
        return res.status(403).json({ error: 'Forbidden' })
      }

      const users = usersCollection()
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      if (!users || !tickets || !comments) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      // 🔍 Fetch owned ticket IDs from user
      const user = await users.findOne({ id: userId })
      const ownedTicketIds = user?.tickets || []

      // 🧾 Fetch owned tickets with comments
      const ownedPromises = ownedTicketIds.map(async (ticketId) => {
        const ticket = await tickets.findOne({ id: ticketId })
        if (!ticket) return null
        const ticketComments = await comments.find({ ticketId }).toArray()
        return { ...ticket, comments: ticketComments }
      })

      const ownedTicketsWithComments = (
        await Promise.all(ownedPromises)
      ).filter((t) => t !== null)

      // 🤝 Fetch shared tickets with comments
      const sharedTicketsRaw = await tickets
        .find({ 'sharedWith.email': authUser.email })
        .toArray()

      const sharedWithUsersTickets = await Promise.all(
        sharedTicketsRaw.map(async (ticket) => {
          const ticketComments = await comments
            .find({ ticketId: ticket.id })
            .toArray()
          return { ...ticket, comments: ticketComments }
        })
      )

      res.status(200).json({
        ownedTicketsWithComments,
        sharedWithUsersTickets,
      })
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      res.status(500).json({ error: 'Failed to fetch tickets' })
    }
  },
}

module.exports = { ticketslistRoutes }
