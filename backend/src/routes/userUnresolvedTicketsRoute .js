const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const userUnresolvedTicketsRoute = {
  path: '/users/:userId/tickets/unresolved',
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

      if (!isAdmin && authUser.uid !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' })
      }

      // Find unresolved tickets: status is 'Open' or 'InProgress'
      const unresolvedTickets = await tickets
        .find({
          status: { $in: ['Open', 'InProgress'] },
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
        .limit(limit + 1)
        .toArray()

      const unresolvedTicketsHasMore = unresolvedTickets.length > limit
      if (unresolvedTicketsHasMore) {
        unresolvedTickets.pop()
      }

      return res
        .status(200)
        .json({ unresolvedTickets, unresolvedTicketsHasMore })
    } catch (error) {
      console.error('❌ Error fetching unresolved tickets:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { userUnresolvedTicketsRoute }
