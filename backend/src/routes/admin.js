const { usersCollection, activitiesCollection } = require('../db.js');
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js');
const logActivity = require('../middleware/logActivity.js');

const makeAdminRoute = {
  path: '/admin/make-admin/:userId',
  method: 'put',
  middleware: [verifyAuthToken, (req, res, next) => {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      console.log('⚠️ Unauthorized: Admin access required', { userId: req.user.uid });
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
  }],
  handler: async (req, res) => {
    try {
      const { userId } = req.params;
      const users = usersCollection();
      const activities = activitiesCollection();

      if (!users || !activities) {
        console.log('⚠️ Database connection not initialized');
        return res.status(500).json({ error: 'Database connection not initialized' });
      }

      const user = await users.findOne({ id: userId });
      if (!user) {
        console.log('⚠️ User not found:', { userId });
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.isAdmin) {
        console.log('⚠️ User is already an admin:', { userId });
        return res.status(400).json({ error: 'User is already an admin' });
      }

      const result = await users.updateOne(
        { id: userId },
        { $set: { isAdmin: true } }
      );

      if (result.modifiedCount === 0) {
        console.log('⚠️ Failed to set admin role:', { userId });
        return res.status(500).json({ error: 'Failed to set admin role' });
      }

      await logActivity(
        'made-admin',
        `Promoted user ${userId} to admin`,
        req.user.uid,
        userId
      );

      console.log('✅ Admin role set for user:', { userId });
      res.json({ message: `Admin role set for user ${userId}` });
    } catch (error) {
      console.error('❌ Error setting admin role:', {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: 'Failed to set admin role', details: error.message });
    }
  },
};

module.exports = { makeAdminRoute };