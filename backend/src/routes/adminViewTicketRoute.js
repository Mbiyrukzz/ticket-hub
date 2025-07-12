const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { isAdmin } = require('../middleware/isAdmin.js')
const logActivity = require('../middleware/logActivity.js')

const adminViewTicketsRoute = {
  path: '/admins/:userId/tickets',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const userDoc = req.userDoc
      const { userId } = req.params
      const { offset = 0, limit = 10 } = req.query

      const tickets = ticketsCollection()
      const users = usersCollection()

      if (!userDoc.isAdmin) {
        return res.status(403).json({ error: 'Only admins can view tickets' })
      }

      let ticketQuery = {}
      let queryDescription = 'Viewed all tickets'

      if (userId) {
        const targetUser = await users.findOne({ id: userId })
        if (!targetUser) {
          return res.status(404).json({ error: 'User not found' })
        }

        ticketQuery = {
          $or: [
            { createdBy: userId },
            { createdFor: userId },
            { assignedTo: userId },
          ],
        }

        queryDescription = `Viewed tickets for user ${userId}`
      }

      const formattedTickets = await tickets
        .aggregate([
          { $match: ticketQuery },
          { $sort: { createdAt: -1 } },
          { $skip: parseInt(offset) },
          { $limit: Math.min(parseInt(limit), 50) },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: 'id',
              as: 'creatorInfo',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'assignedTo',
              foreignField: 'id',
              as: 'assigneeInfo',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'createdFor',
              foreignField: 'id',
              as: 'createdForInfo',
            },
          },
          {
            $addFields: {
              userName: { $arrayElemAt: ['$creatorInfo.name', 0] },
              assignedToName: { $arrayElemAt: ['$assigneeInfo.name', 0] },
              createdForName: { $arrayElemAt: ['$createdForInfo.name', 0] },
            },
          },
          {
            $project: {
              creatorInfo: 0,
              assigneeInfo: 0,
              createdForInfo: 0,
            },
          },
        ])
        .toArray()

      const sharedWithUsersTickets = await tickets
        .aggregate([
          {
            $match: {
              'sharedWith.email': {
                $regex: `^${userDoc.email}$`,
                $options: 'i',
              },
            },
          },
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
            },
          },
          {
            $project: {
              _id: 0,
              id: 1,
              sharedWith: 1,
              title: 1,
              content: 1,
              image: 1,
              comments: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
              userName: 1,
            },
          },
        ])
        .toArray()

      await logActivity(
        'admin-viewed-tickets',
        queryDescription,
        authUser.uid,
        userId || 'all'
      )

      res.status(200).json({
        tickets: formattedTickets,
        shared: sharedWithUsersTickets,
      })
    } catch (error) {
      console.error('❌ Admin ticket view error:', error.message)
      res.status(500).json({
        error: 'Failed to retrieve tickets',
        details: error.message,
      })
    }
  },
}

module.exports = { adminViewTicketsRoute }
