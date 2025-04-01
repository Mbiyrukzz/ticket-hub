const { activitiesCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const getActivitiesRoute = {
  path: '/activities',
  method: 'get',
  middleware: [verifyAuthToken], // Remove logActivity from middleware
  handler: async (req, res) => {
    const authUser = req.user

    try {
      const activities = activitiesCollection()
      if (!activities) {
        console.log('⚠️ Database connection not initialized')
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      console.log('🔍 Fetching activities for user:', {
        userId: authUser.uid,
        timestamp: new Date().toISOString(),
      })

      // Fetch the latest 10 activities for the user
      const activitiesList = await activities
        .find({ userId: authUser.uid }) // Query by userId (string)
        .sort({ time: -1 }) // Sort by time in descending order (newest first)
        .limit(10)
        .toArray()

      console.log('✅ Activities fetched successfully:', activitiesList)
      res.status(200).json(activitiesList)
    } catch (error) {
      console.error('❌ Error in get activities route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to fetch activities',
        details: error.message,
      })
    }
  },
}

module.exports = getActivitiesRoute
