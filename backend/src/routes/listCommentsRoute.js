const {
  ticketsCollection,
  usersCollection,
  commentsCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const listCommentsRoute = {
  path: '/tickets/:ticketId/comments',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const { ticketId } = req.params
    const authUser = req.user

    if (!authUser?.uid || !authUser?.email) {
      return res.status(401).json({ error: 'Invalid user authentication' })
    }

    try {
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      const users = usersCollection()

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      const currentUser = await users.findOne({ id: authUser.uid })
      const isAdmin = currentUser?.isAdmin === true
      const normalizedEmail = authUser.email.trim().toLowerCase()

      const isOwner =
        ticket.createdBy === authUser.uid || ticket.createdFor === authUser.uid

      const isShared = (ticket.sharedWith || []).some(
        (u) => u.email?.trim().toLowerCase() === normalizedEmail
      )

      if (!isOwner && !isShared && !isAdmin) {
        return res.status(403).json({
          error: 'Unauthorized to view comments for this ticket',
        })
      }

      const ticketCommentsWithUsers = await comments
        .aggregate([
          { $match: { ticketId } },
          { $sort: { createdAt: 1 } },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: 'id',
              as: 'author',
            },
          },
          {
            $addFields: {
              userName: {
                $ifNull: [
                  { $arrayElemAt: ['$author.name', 0] },
                  { $arrayElemAt: ['$author.userName', 0] },
                ],
              },
              isAdmin: { $arrayElemAt: ['$author.isAdmin', 0] },
            },
          },
          {
            $project: {
              author: 0,
              _id: 0,
            },
          },
        ])
        .toArray()

      console.log({
        ticketUserId: ticket.userId,
        authUserId: authUser.uid,
        isSharedWith: ticket.sharedWith,
        isAdmin: currentUser?.isAdmin,
      })

      return res.status(200).json({ comments: ticketCommentsWithUsers })
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { listCommentsRoute }
