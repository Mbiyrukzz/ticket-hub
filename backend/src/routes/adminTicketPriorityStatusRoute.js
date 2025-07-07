const { ticketsCollection } = require('../db')
const { isAdmin } = require('../middleware/isAdmin')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const adminTicketStatusLineChartRoute = {
  path: '/admins/ticket-status-line-chart',
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
      const statusStats = await tickets
        .aggregate([
          {
            $group: {
              _id: {
                status: '$status',
                date: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
              },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray()

      const formatted = {
        labels: [],
        open: [],
        inProgress: [],
        resolved: [],
      }

      const dates = [
        ...new Set(statusStats.map((stat) => stat._id.date)),
      ].sort()

      formatted.labels = dates

      dates.forEach((date) => {
        const openStat =
          statusStats.find(
            (stat) => stat._id.date === date && stat._id.status === 'Open'
          )?.count || 0
        const inProgressStat =
          statusStats.find(
            (stat) => stat._id.date === date && stat._id.status === 'InProgress'
          )?.count || 0
        const resolvedStat =
          statusStats.find(
            (stat) => stat._id.date === date && stat._id.status === 'Resolved'
          )?.count || 0

        formatted.open.push(openStat)
        formatted.inProgress.push(inProgressStat)
        formatted.resolved.push(resolvedStat)
      })

      res.json(formatted)
    } catch (error) {
      console.error('❌ Error fetching status chart:', error)
      res
        .status(500)
        .json({ error: `Failed to get status chart data: ${error.message}` })
    }
  },
}

module.exports = { adminTicketStatusLineChartRoute }
