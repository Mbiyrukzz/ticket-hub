const admin = require('firebase-admin')

const verifyAuthToken = async (req, res, next) => {
  try {
    const authtoken = req.headers.authtoken
    console.log('🔍 Verifying token for:', { method: req.method, url: req.url })
    console.log(
      '🔍 Token:',
      authtoken ? authtoken.substring(0, 10) + '...' : 'Missing'
    )

    if (!authtoken) {
      return res.status(401).json({ error: 'No authentication token provided' })
    }

    const authUser = await admin.auth().verifyIdToken(authtoken)
    console.log('🔍 Auth user:', { uid: authUser.uid, email: authUser.email })
    req.user = authUser
    next()
  } catch (error) {
    console.error('❌ Auth Token Verification Failed:', error.message, {
      method: req.method,
      url: req.url,
    })
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { verifyAuthToken }
