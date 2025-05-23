const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const getTicketStatsRoute = {
  path: '/users/:userId/tickets/stats',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const { userId } = req.params
    const authUser = req.user

    if (authUser.uid !== userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    try {
      const users = usersCollection()
      const tickets = ticketsCollection()

      const user = await users.findOne({ id: userId })
      if (!user) return res.status(404).json({ error: 'User not found' })

      const totalTickets = await tickets.countDocuments({ createdBy: userId })

      // Optional: Count tickets by status
      const openTickets = await tickets.countDocuments({
        createdBy: userId,
        status: 'open',
      })

      const closedTickets = await tickets.countDocuments({
        createdBy: userId,
        status: 'closed',
      })

      res.json({
        total: totalTickets,
        open: openTickets,
        closed: closedTickets,
      })
    } catch (err) {
      console.error('Ticket stats error:', err)
      res.status(500).json({ error: 'Failed to fetch ticket stats' })
    }
  },
}

module.exports = { getTicketStatsRoute }
