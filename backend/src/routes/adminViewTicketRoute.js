const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { isAdmin } = require('../middleware/isAdmin.js')
const logActivity = require('../middleware/logActivity.js')

const adminViewTicketsRoute = {
  path: '/admins/:userId/tickets', // Optional userId parameter
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const userDoc = req.userDoc
      const { userId } = req.params
      const tickets = ticketsCollection()
      const users = usersCollection()

      // Ensure the authenticated user is an admin
      if (!userDoc.isAdmin) {
        return res.status(403).json({ error: 'Only admins can view tickets' })
      }

      let ticketQuery = {}
      let queryDescription = 'Viewed all tickets'

      // If userId is provided, filter tickets by createdFor or assignedTo
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

      // Fetch and format tickets with comments and creator info
      const formattedTickets = await tickets
        .aggregate([
          { $match: ticketQuery },
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
              creatorInfo: 0,
            },
          },
        ])
        .toArray()

      // Optional: Fetch tickets shared with this admin (if needed)
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

      // Log the admin's viewing activity
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
