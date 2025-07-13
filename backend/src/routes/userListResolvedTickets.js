const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const userResolvedTicketsRoute = {
  path: '/users/:userId/tickets/resolved',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const { userId } = req.params
    const authUser = req.user
    const isAdmin = authUser?.isAdmin || authUser?.admin

    const offset = parseInt(req.query.offset || '0', 10)
    const limit = parseInt(req.query.limit || '10', 10)

    try {
      const users = usersCollection()
      const tickets = ticketsCollection()

      const user = await users.findOne({ id: userId })
      if (!user) return res.status(404).json({ error: 'User not found' })

      // Authorization: only allow self or admin
      if (!isAdmin && authUser.uid !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' })
      }

      // Find all resolved tickets where user is creator, target, or shared
      const resolvedTickets = await tickets
        .find({
          status: 'Resolved',
          $or: [
            { createdBy: userId },
            { createdFor: userId },
            {
              'sharedWith.email': {
                $regex: `^${user.email}$`,
                $options: 'i',
              },
            },
          ],
        })
        .sort({ updatedAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray()

      return res.status(200).json({ resolvedTickets })
    } catch (error) {
      console.error('❌ Error fetching resolved tickets:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { userResolvedTicketsRoute }
