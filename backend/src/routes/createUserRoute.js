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
        isAdmin: false,
        createdAt: new Date(),
      }

      console.log('🔍 Create User Request Details:', {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        timestamp: new Date().toISOString(),
      })

      // Insert user directly without transaction
      console.log('🔍 Attempting to insert user...')
      const result = await users.insertOne(newUser)
      console.log('🔍 Insert result:', {
        acknowledged: result.acknowledged,
        insertedId: result.insertedId,
        fullResult: result,
      })

      if (!result.acknowledged) {
        console.error('❌ Insert not acknowledged')
        throw new Error('Failed to insert new user - not acknowledged')
      }

      if (!result.insertedId) {
        console.error('❌ No insertedId returned')
        throw new Error('Failed to insert new user - no ID returned')
      }

      const mongoId = result.insertedId
      console.log('✅ User inserted with MongoDB ID:', mongoId)

      // Verify the user was actually inserted
      const insertedUser = await users.findOne({ id: newUser.id })
      console.log('🔍 Verification - User found after insert:', !!insertedUser)

      // Log activity (outside of transaction now)
      try {
        await logActivity(
          'created-user',
          `Created a new user account`,
          newUser.id,
          null
        )
        console.log('✅ Activity logged successfully')
      } catch (activityError) {
        console.error(
          '⚠️ Activity logging failed (but user was created):',
          activityError.message
        )
        // Don't fail the entire operation if activity logging fails
      }

      const response = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt.toISOString(),
        _id: mongoId.toString(),
      }

      console.log('✅ User created successfully:', response)
      res.status(201).json(response)
    } catch (error) {
      console.error('❌ Error in create user route:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      res.status(500).json({
        error: 'Failed to create user',
        details: error.message,
      })
    }
  },
}

module.exports = { createUserRoute }
