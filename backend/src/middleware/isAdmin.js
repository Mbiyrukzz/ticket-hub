// server/middleware/auth.js
const { usersCollection } = require('../db.js')

const isAdmin = async (req, res, next) => {
  try {
    const authUser = req.user

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const users = usersCollection()
    const user = await users.findOne({ id: authUser.uid })

    if (!user) {
      console.log('⚠️ User not found:', { uid: authUser.uid })
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.isAdmin) {
      console.log('⚠️ Admin access denied:', {
        uid: authUser.uid,
        isAdmin: user.isAdmin,
      })
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    req.userDoc = user // Attach user document for downstream use
    next()
  } catch (error) {
    console.error('❌ Error in isAdmin middleware:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { isAdmin }
