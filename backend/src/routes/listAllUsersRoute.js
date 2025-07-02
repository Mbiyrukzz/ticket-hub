const path = require('path')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')

const { usersCollection } = require('../db')

const listAllUsersRoute = {
  path: '/admins/users',
  method: 'get',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const authUser = req.user
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      console.log('Access Denied: Only Admins Can List Users', {
        uid: authUser.uid,
        isAdmin: userDoc?.isAdmin,
      })
      return res
        .status(403)
        .json({ error: 'Forbidden: Admin privileges required' })
    }
    try {
      const users = await usersCollection().find({}).toArray()
      console.log('Fetched Users:', { count: users.length, user: authUser.uid })
      res.status(200).json({ users })
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  },
}

module.exports = { listAllUsersRoute }
