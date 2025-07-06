const { ticketsCollection, usersCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')

const adminNotificationsRoute = {
  path: '/admins/notifications',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can access notifications' })
    }

    try {
      const tickets = ticketsCollection()
      const users = usersCollection()

      // Pagination values
      const limit = Math.min(parseInt(req.query.limit) || 10, 20)
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const skip = (page - 1) * limit

      const recentTickets = await tickets
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      const userIds = [
        ...new Set(recentTickets.map((t) => t.createdBy).filter(Boolean)),
      ]

      const userDocs = await users
        .find({ id: { $in: userIds } })
        .project({ id: 1, name: 1, displayName: 1, email: 1 })
        .toArray()

      const userMap = {}
      for (const u of userDocs) {
        userMap[u.id] =
          u.name ||
          u.displayName ||
          (u.email ? u.email.split('@')[0] : 'Unknown')
      }

      const formatted = recentTickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        createdBy: ticket.createdBy,
        userName: ticket.userName || userMap[ticket.createdBy] || 'Unknown',
        assignedTo: ticket.assignedTo || null,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        commentCount: ticket.comments?.length || 0,
      }))

      res.json({ notifications: formatted })
    } catch (error) {
      console.error('❌ Error fetching admin notifications:', error)
      res.status(500).json({ error: 'Failed to fetch admin notifications' })
    }
  },
}

module.exports = { adminNotificationsRoute }
