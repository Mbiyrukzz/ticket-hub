const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { usersCollection, activitiesCollection } = require('../db.js')
const logActivity = require('../middleware/logActivity.js')

const createUserRoute = {
  method: 'post',
  path: '/users',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const { name } = req.body

      const users = usersCollection()
      const activities = activitiesCollection()

      if (!users || !activities) {
        console.log('⚠️ Database connection not initialized')
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      // Validate input
      if (!name?.trim()) {
        console.log('⚠️ Validation failed: Name is required', { name })
        return res.status(400).json({ error: 'Name is required' })
      }

      // Check for duplicate email
      const existingUser = await users.findOne({ email: authUser.email })
      if (existingUser) {
        console.log('⚠️ Email already in use:', { email: authUser.email })
        return res.status(409).json({ error: 'Email already in use' })
      }

      const newUser = {
        id: authUser.uid,
        email: authUser.email,
        name: name.trim(),
        tickets: [],
        comments: [],
        createdAt: new Date(),
      }

      console.log('🔍 Create User Request Details:', {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        timestamp: new Date().toISOString(),
      })

      const session = users.client.startSession()
      let response

      try {
        await session.withTransaction(async () => {
          const result = await users.insertOne(newUser)
          if (!result.acknowledged) {
            throw new Error('Failed to insert new user')
          }
          const mongoId = result.insertedId

          await logActivity(
            'created-user',
            `Created a new user account`,
            newUser.id,
            null
          )

          response = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            createdAt: newUser.createdAt.toISOString(),
            _id: mongoId.toString(),
          }

          console.log('✅ User created successfully:', response)
        })
      } catch (error) {
        console.error('❌ Transaction failed:', error)
        throw new Error('Transaction failed')
      } finally {
        await session.endSession()
      }

      res.status(201).json(response)
    } catch (error) {
      console.error('❌ Error in create user route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to create user',
        details: error.message,
      })
    }
  },
}

module.exports = { createUserRoute }
