// server/routes/admins.js
const { ticketsCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')

const adminAssignedOtherUserTickets = {
  path: '/admins/:userId/assigned-tickets',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const { userId } = req.params
    const authUser = req.user
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      console.log('⚠️ Access denied (not admin):', authUser.uid)
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    try {
      const cursor = ticketsCollection()
        .find({ assignedTo: userId })
        .skip(offset)
        .limit(limit)

      const assignedTickets = await cursor.toArray()

      console.log('✅ Fetched tickets assigned to user:', {
        count: assignedTickets.length,
        requestedFor: userId,
        byAdmin: authUser.uid,
      })

      res.status(200).json({ tickets: assignedTickets })
    } catch (error) {
      console.error('❌ Error fetching assigned tickets for user:', error)
      res.status(500).json({ error: 'Failed to fetch assigned tickets' })
    }
  },
}

module.exports = { adminAssignedOtherUserTickets }
