const admin = require('firebase-admin');
const { usersCollection } = require('../db.js');

const verifyAuthToken = async (req, res, next) => {
  try {
    const authtoken = req.headers.authtoken;
    console.log('🔍 Backend received token:', authtoken?.substring(0, 10) + '...');
    if (!authtoken) {
      console.log('⚠️ No token provided');
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    const authUser = await admin.auth().verifyIdToken(authtoken);
    console.log('🔍 Token verified:', { uid: authUser.uid });
    const users = usersCollection();
    const dbUser = await users.findOne({ id: authUser.uid });
    if (!dbUser) {
      console.log('⚠️ User not found in MongoDB:', { uid: authUser.uid });
      return res.status(404).json({ error: 'User not found in database' });
    }
    req.user = { ...authUser, isAdmin: dbUser.isAdmin || false };
    console.log('✅ User authenticated:', { uid: authUser.uid, isAdmin: req.user.isAdmin });
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', {
      message: error.message,
      code: error.code,
    });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyAuthToken };