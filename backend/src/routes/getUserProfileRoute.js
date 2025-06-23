const { verifyAuthToken } = require('../middleware/verifyAuthToken.js');
const { usersCollection } = require('../db.js');

const getUserProfileRoute = {
  path: '/admins/:userId/profile',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('📥 Processing profile request:', { userId, authUserId: req.user?.uid });

      const users = usersCollection();
      if (!users) {
        console.error('❌ Database collection not initialized');
        return res.status(500).json({ error: 'Database connection not initialized' });
      }

      if (req.user.uid !== userId) {
        console.log('⚠️ Unauthorized access attempt:', { userId, authUserId: req.user.uid });
        return res.status(403).json({ error: 'Forbidden' });
      }

      const dbUser = await users.findOne({ id: userId });
      if (!dbUser) {
        console.log('⚠️ User not found in MongoDB:', { userId });
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || '',
        isAdmin: dbUser.isAdmin ?? false,
        tickets: dbUser.tickets ?? [],
        comments: dbUser.comments ?? [],
        
      };
      

      console.log('✅ Fetched user profile:', { userId, isAdmin: userData.isAdmin });
      res.json({ user: userData });
    } catch (error) {
      console.error('❌ Error fetching user profile:', {
        message: error.message,
        stack: error.stack,
        userId: req.params.userId,
        code: error.code,
      });
      res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
  },
};

module.exports = { getUserProfileRoute };