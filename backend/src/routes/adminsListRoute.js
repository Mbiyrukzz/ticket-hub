const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')
const { usersCollection } = require('../db')

const adminListRoute = {
  path: '/admins/list',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const authUser = req.user
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      console.log('Access Denied: Only Admins Can View Admin List', {
        uid: authUser.uid,
        isAdmin: userDoc?.isAdmin,
      })
      return res
        .status(403)
        .json({ error: 'Forbidden: Admin privileges required' })
    }

    try {
      const admins = await usersCollection()
        .find({ isAdmin: true })
        .project({ uid: 1, displayName: 1, email: 1 })
        .toArray()

      console.log('Fetched Admins:', {
        count: admins.length,
        requestedBy: authUser.uid,
      })

      res.status(200).json({ admins })
    } catch (error) {
      console.error('Error fetching admins:', error)
      res.status(500).json({ error: 'Failed to fetch admin list' })
    }
  },
}

module.exports = { adminListRoute }
