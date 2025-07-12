const { ticketsCollection } = require('../db')
const { isAdmin } = require('../middleware/isAdmin')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const adminAssignedToMeTickets = {
  path: '/admins/my-tickets',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const authUser = req.user
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      console.log('⚠️ Access denied (not admin):', authUser.uid)
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    try {
      const assignedTickets = await ticketsCollection()
        .find({ assignedTo: authUser.uid })
        .toArray()

      console.log('✅ Fetched assigned tickets:', {
        count: assignedTickets.length,
        admin: authUser.uid,
      })
      res.status(200).json({ tickets: assignedTickets })
    } catch (error) {
      console.error('❌ Error fetching assigned tickets:', error)
      res.status(500).json({ error: 'Failed to fetch assigned tickets' })
    }
  },
}

module.exports = { adminAssignedToMeTickets }
