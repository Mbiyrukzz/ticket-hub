const { activitiesCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const logActivity = require('../middleware/logActivity.js')

const deleteActivitiesRoute = {
  path: '/activities',
  method: 'delete',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const userId = authUser.uid

      const activities = activitiesCollection()
      if (!activities) {
        console.log('⚠️ Database connection not initialized')
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      console.log('🔍 Delete Activities Request Details:', {
        userId,
        timestamp: new Date().toISOString(),
      })

      const session = activities.client.startSession()
      try {
        await session.withTransaction(async () => {
          // Delete all activities for the user
          const deleteResult = await activities.deleteMany({ userId: userId })
          console.log('✅ Deleted activities:', {
            userId,
            deletedCount: deleteResult.deletedCount,
          })

          // Log the activity after deleting activities
          await logActivity(
            'cleared-activities',
            `Cleared all activities`,
            userId,
            null // No ticketId for this action
          )
          console.log('✅ Activity logged for cleared activities')
        })
      } finally {
        await session.endSession()
      }

      console.log('✅ All activities deleted successfully')
      res
        .status(200)
        .json({ message: '✅ All activities deleted successfully' })
    } catch (error) {
      console.error('❌ Error in delete activities route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to delete activities',
        details: error.message,
      })
    }
  },
}

module.exports = { deleteActivitiesRoute }
