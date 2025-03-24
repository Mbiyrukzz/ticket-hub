import { MongoClient } from 'mongodb'

let client = null

export let ticketsCollection = null
export let commentsCollection = null

export const initializeDbConnection = async () => {
  client = new MongoClient('mongodb://localhost:27017')
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error)
  }
  ticketsCollection = client.db('tickets-app-db').collection('tickets')

  commentsCollection = client.db('tickets-app-db').collection('comments')
}
