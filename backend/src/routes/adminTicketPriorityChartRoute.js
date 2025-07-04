const { ticketsCollection } = require('../db')
const { isAdmin } = require('../middleware/isAdmin')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const adminTicketPriorityChartRoute = {
  path: '/admins/ticket-priority-chart',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const userDoc = req.userDoc

    if (!userDoc.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can access this chart' })
    }

    try {
      const tickets = ticketsCollection()

      const priorityStats = await tickets
        .aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
        .toArray()

      const formatted = {
        High: 0,
        Medium: 0,
        Low: 0,
      }

      for (const stat of priorityStats) {
        if (['High', 'Medium', 'Low'].includes(stat._id)) {
          formatted[stat._id] = stat.count
        }
      }

      res.json(formatted)
    } catch (error) {
      console.error('❌ Error fetching priority chart:', error)
      res.status(500).json({ error: 'Failed to get priority chart data' })
    }
  },
}

module.exports = { adminTicketPriorityChartRoute }
