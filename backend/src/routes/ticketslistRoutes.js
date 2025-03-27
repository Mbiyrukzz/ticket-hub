const {
  ticketsCollection,
  usersCollection,
  commentsCollection,
} = require('../db.js')

const ticketslistRoutes = {
  path: '/users/:userId/tickets',
  method: 'get',
  handler: async (req, res) => {
    const { userId } = req.params
    try {
      // Ensure collections are initialized
      const users = usersCollection()
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      if (!users || !tickets || !comments) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      // Fetch the user
      const user = await users.findOne({ id: userId })
      if (!user || !user.tickets || user.tickets.length === 0) {
        console.log('⚠️ No tickets found for userId:', userId)
        return res.status(200).json([]) // Return empty array instead of 404
      }

      // Fetch tickets using Promise.all()
      const ticketPromises = user.tickets.map(async (ticketId) => {
        console.log(`🔍 Checking ticket ID: ${ticketId}`)
        const ticket = await tickets.findOne({ id: ticketId }) // Use ticketId directly
        if (!ticket) {
          console.log(`⚠️ Ticket not found for ID: ${ticketId}`)
          return null
        }

        // Fetch comments for this ticket
        const ticketComments = await comments
          .find({ ticketId: ticketId })
          .toArray()

        return { ...ticket, comments: ticketComments }
      })

      const ticketsWithComments = await Promise.all(ticketPromises)

      // Filter out any null values (if tickets were not found)
      const filteredTickets = ticketsWithComments.filter(
        (ticket) => ticket !== null
      )

      console.log('✅ Fetched tickets:', filteredTickets)
      res.status(200).json(filteredTickets)
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      res.status(500).json({ error: 'Failed to fetch tickets' })
    }
  },
}

module.exports = { ticketslistRoutes }
