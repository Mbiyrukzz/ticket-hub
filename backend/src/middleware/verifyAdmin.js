const { usersCollection } = require('../db.js')

const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user.uid
    console.log('🔍 Verifying admin for user:', userId)
    const user = await usersCollection().findOne({ id: userId })
    console.log('🔍 User document:', user)

    if (!user || !user.isAdmin) {
      console.log('⚠️ Admin check failed:', {
        userExists: !!user,
        isAdmin: user?.isAdmin,
      })
      return res
        .status(403)
        .json({ error: 'Unauthorized: Admin access required' })
    }

    console.log('✅ Admin check passed')
    next()
  } catch (error) {
    console.error('Admin check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { verifyAdmin }
module.exports = { verifyAdmin }
