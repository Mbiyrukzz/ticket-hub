const admin = require('firebase-admin')

const verifyAuthToken = async (req, res, next) => {
  try {
    const authtoken = req.headers.authtoken

    if (!authtoken) {
      return res.status(401).json({ error: 'No authentication token provided' })
    }

    const authUser = await admin.auth().verifyIdToken(authtoken)

    req.user = authUser

    next()
  } catch (error) {
    console.error('❌ Auth Token Verification Failed:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { verifyAuthToken }
