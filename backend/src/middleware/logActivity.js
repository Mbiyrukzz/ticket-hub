const { v4: uuidv4 } = require('uuid')
const { activitiesCollection } = require('../db.js')

const logActivity = async (type, message, userId, ticketId) => {
  try {
    const activities = activitiesCollection()
    console.log('🔍 Logging activity:', { type, message, userId, ticketId })

    const activity = {
      id: uuidv4(), // Generate a unique ID for the activity
      type,
      message,
      time: new Date().toISOString(), // Store the timestamp as an ISO string
      userId,
      ticketId,
    }

    const result = await activities.insertOne(activity)
    if (result.insertedId) {
      console.log('✅ Activity logged successfully:', activity)
      return activity
    } else {
      throw new Error('Failed to insert activity')
    }
  } catch (error) {
    console.error('❌ Error logging activity:', {
      message: error.message,
      stack: error.stack,
    })
    throw new Error('Failed to log activity: ' + error.message)
  }
}

module.exports = logActivity
