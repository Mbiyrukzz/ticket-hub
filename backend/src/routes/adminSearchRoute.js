const {
  usersCollection,
  ticketsCollection,
  commentsCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { isAdmin } = require('../middleware/isAdmin.js')

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const adminSearchRoute = {
  path: '/admins/search',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const query = req.query.q?.trim()
    const skip = parseInt(req.query.skip) || 0
    const limit = parseInt(req.query.limit) || 8

    if (!query) {
      return res.status(400).json({ error: 'Search query "q" is required' })
    }

    try {
      const users = usersCollection()
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      const searchRegex = new RegExp(escapeRegex(query), 'i')

      const [foundUsers, foundTickets, foundComments] = await Promise.all([
        users
          .find({
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { id: searchRegex },
            ],
          })
          .project({ _id: 0, id: 1, name: 1, email: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),

        tickets
          .find({
            $or: [
              { title: searchRegex },
              { content: searchRegex },
              { id: searchRegex },
            ],
          })
          .project({ _id: 0, id: 1, title: 1, status: 1, priority: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),

        comments
          .find({
            $or: [
              { content: searchRegex },
              { userName: searchRegex },
              { ticketId: searchRegex },
            ],
          })
          .project({ _id: 0, id: 1, userName: 1, content: 1, ticketId: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
      ])

      return res.status(200).json({
        users: foundUsers,
        tickets: foundTickets,
        comments: foundComments,
        counts: {
          users: foundUsers.length,
          tickets: foundTickets.length,
          comments: foundComments.length,
        },
      })
    } catch (error) {
      console.error('❌ Admin search error:', error)
      return res
        .status(500)
        .json({ error: 'Search failed', details: error.message })
    }
  },
}

module.exports = { adminSearchRoute }
