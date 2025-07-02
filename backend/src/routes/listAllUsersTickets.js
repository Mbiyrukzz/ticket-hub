// server/routes/admins.js
const { ticketsCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')

const listAllUsersTickets = {
  path: '/admins/tickets',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const authUser = req.user
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      console.log('⚠️ Admin access denied:', {
        uid: authUser.uid,
        isAdmin: userDoc?.isAdmin,
      })
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    try {
      const tickets = await ticketsCollection().find({}).toArray()
      console.log('✅ Fetched tickets:', {
        count: tickets.length,
        user: authUser.uid,
      })
      res.status(200).json({ tickets })
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      res.status(500).json({ error: 'Failed to fetch tickets' })
    }
  },
}

module.exports = { listAllUsersTickets }
