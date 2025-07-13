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
    const isAdmin = authUser.isAdmin === true || authUser.admin === true

    // Handle pagination params
    const offset = parseInt(req.query.offset) || 0
    const limit = parseInt(req.query.limit) || 10

    try {
      const collections = {
        users: usersCollection(),
        tickets: ticketsCollection(),
        comments: commentsCollection(),
      }

      if (!collections.users || !collections.tickets || !collections.comments) {
        return res.status(500).json({ error: 'Database unavailable' })
      }

      const user = await collections.users.findOne({ id: userId })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      if (!isAdmin && authUser.uid !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' })
      }

      const commentLookup = {
        $lookup: {
          from: 'comments',
          let: { ticket_id: '$id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$ticketId', '$$ticket_id'] } } },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'id',
                as: 'authorInfo',
              },
            },
            {
              $addFields: {
                isAdmin: { $arrayElemAt: ['$authorInfo.isAdmin', 0] },
              },
            },
            { $project: { authorInfo: 0 } },
          ],
          as: 'comments',
        },
      }

      const creatorLookup = {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: 'id',
          as: 'creatorInfo',
        },
      }

      const addUserName = {
        $addFields: {
          userName: { $arrayElemAt: ['$creatorInfo.name', 0] },
        },
      }

      const hideCreatorInfo = {
        $project: {
          creatorInfo: 0,
        },
      }

      // Fetch owned tickets
      const ownedTicketsWithComments = await collections.tickets
        .aggregate([
          { $match: isAdmin ? {} : { id: { $in: user.tickets || [] } } },
          { $sort: { createdAt: -1 } },
          { $skip: offset },
          { $limit: limit },
          commentLookup,
          creatorLookup,
          addUserName,
          hideCreatorInfo,
        ])
        .toArray()

      const ownedWithPost = ownedTicketsWithComments.map((ticket) => ({
        ...ticket,
        post: 'owner',
      }))

      // Fetch sharedWith tickets
      const sharedWithUsersTickets = await collections.tickets
        .aggregate([
          {
            $match: {
              'sharedWith.email': {
                $regex: `^${user.email}$`,
                $options: 'i',
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: offset },
          { $limit: limit },
          commentLookup,
          creatorLookup,
          addUserName,
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

      const sharedWithUsersTicketsFormatted = sharedWithUsersTickets.map(
        (ticket) => ({
          ...ticket,
          post: 'shared',
        })
      )

      // Fetch createdFor tickets
      const createdForTickets = await collections.tickets
        .aggregate([
          {
            $match: {
              createdFor: userId,
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: offset },
          { $limit: limit },
          commentLookup,
          creatorLookup,
          addUserName,
          hideCreatorInfo,
        ])
        .toArray()

      const createdForWithPost = createdForTickets.map((ticket) => ({
        ...ticket,
        post: 'createdFor',
      }))

      return res.status(200).json({
        isAdmin,
        offset,
        limit,
        ownedTicketsWithComments: ownedWithPost,
        sharedWithUsersTicketsFormatted,
        createdForTickets: createdForWithPost,
      })
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { ticketslistRoutes }
