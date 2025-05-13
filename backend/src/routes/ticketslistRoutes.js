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
      // Validate user ID match
      if (authUser.uid !== userId) {
        return res.status(403).json({ error: 'Forbidden: Unauthorized access' })
      }

      // Check database collections
      const collections = {
        users: usersCollection(),
        tickets: ticketsCollection(),
        comments: commentsCollection(),
      }

      if (!collections.users || !collections.tickets || !collections.comments) {
        return res
          .status(500)
          .json({ error: 'Internal Server Error: Database unavailable' })
      }

      // Fetch user data
      const user = await collections.users.findOne({ id: userId })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Fetch owned tickets with comments
      const ownedTicketsWithComments = await collections.tickets
        .aggregate([
          { $match: { id: { $in: user.tickets || [] } } },
          {
            $lookup: {
              from: 'comments',
              localField: 'id',
              foreignField: 'ticketId',
              as: 'comments',
            },
          },
        ])
        .toArray()

      // Fetch shared tickets with comments
      const sharedWithUsersTickets = await collections.tickets
        .aggregate([
          {
            $match: {
              'sharedWith.email': { $regex: `^${user.email}$`, $options: 'i' },
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
            },
          },
        ])
        .toArray()

      const sharedWithUsersTicketsFormatted = sharedWithUsersTickets.map(
        (ticket) => ({
          ...ticket,
          role:
            ticket.sharedWith.find(
              (setting) =>
                setting.email.toLowerCase() === user.email.toLowerCase()
            )?.role || 'view',
        })
      )

      return res.status(200).json({
        ownedTicketsWithComments,
        sharedWithUsersTicketsFormatted,
      })
    } catch (error) {
      console.error('Error fetching tickets:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}
module.exports = { ticketslistRoutes }
