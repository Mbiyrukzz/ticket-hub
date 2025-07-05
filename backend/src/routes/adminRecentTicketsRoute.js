const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { isAdmin } = require('../middleware/isAdmin.js')

const adminRecentTicketsRoute = {
  path: '/admins/:userId/recent-tickets',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
      const userDoc = req.userDoc

      if (!userDoc?.isAdmin) {
        return res
          .status(403)
          .json({ error: 'Only admins can access recent tickets' })
      }

      const tickets = ticketsCollection()

      const recentTickets = await tickets
        .aggregate([
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
          {
            $lookup: {
              from: 'comments',
              localField: 'id',
              foreignField: 'ticketId',
              as: 'comments',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: 'id',
              as: 'creatorInfo',
            },
          },
          {
            $addFields: {
              userName: { $arrayElemAt: ['$creatorInfo.name', 0] },
              commentCount: { $size: '$comments' },
            },
          },
          {
            $project: {
              _id: 0,
              id: 1,
              title: 1,
              status: 1,
              priority: 1,
              createdAt: 1,
              userName: 1,
              commentCount: 1,
            },
          },
        ])
        .toArray()

      res.status(200).json({ tickets: recentTickets })
    } catch (error) {
      console.error(
        '❌ Error fetching recent dashboard tickets:',
        error.message
      )
      res.status(500).json({
        error: 'Failed to retrieve recent tickets',
        details: error.message,
      })
    }
  },
}

module.exports = { adminRecentTicketsRoute }
