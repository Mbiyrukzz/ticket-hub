const { MongoClient } = require('mongodb')

let client = null
let ticketsCollection = null
let commentsCollection = null
let usersCollection = null
let activitiesCollection = null // Add activitiesCollection

const initializeDbConnection = async () => {
  if (client) {
    console.log('✅ MongoDB connection already established')
    return
  }

  client = new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  })

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', {
      message: error.message,
      stack: error.stack,
    })
    throw error // Re-throw the error to be handled by the caller
  }

  const db = client.db('tickets-app-db')
  ticketsCollection = db.collection('tickets')
  commentsCollection = db.collection('comments')
  usersCollection = db.collection('users')
  activitiesCollection = db.collection('activities') // Initialize activitiesCollection
}

// Function to get the activities collection
const getActivitiesCollection = () => {
  if (!activitiesCollection) {
    console.error('❌ Activities collection not initialized')
    throw new Error('Activities collection not initialized')
  }
  return activitiesCollection
}

module.exports = {
  initializeDbConnection,
  ticketsCollection: () => {
    if (!ticketsCollection) {
      console.error('❌ Tickets collection not initialized')
      throw new Error('Tickets collection not initialized')
    }
    return ticketsCollection
  },
  commentsCollection: () => {
    if (!commentsCollection) {
      console.error('❌ Comments collection not initialized')
      throw new Error('Comments collection not initialized')
    }
    return commentsCollection
  },
  usersCollection: () => {
    if (!usersCollection) {
      console.error('❌ Users collection not initialized')
      throw new Error('Users collection not initialized')
    }
    return usersCollection
  },
  activitiesCollection: getActivitiesCollection, // Export activitiesCollection
}
