const { MongoClient } = require('mongodb')

let client = null

let ticketsCollection = null
let commentsCollection = null
let usersCollection = null

const initializeDbConnection = async () => {
  client = new MongoClient('mongodb://localhost:27017')
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error)
  }
  ticketsCollection = client.db('tickets-app-db').collection('tickets')
  commentsCollection = client.db('tickets-app-db').collection('comments')
  usersCollection = client.db('tickets-app-db').collection('users')
}

module.exports = {
  initializeDbConnection,
  ticketsCollection: () => ticketsCollection,
  commentsCollection: () => commentsCollection,
  usersCollection: () => usersCollection,
}
