const { v4: uuidv4 } = require('uuid')
const { ticketsCollection, usersCollection } = require('../db.js')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const logActivity = require('../middleware/logActivity.js')

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'Uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  },
})

const upload = multer({ storage })

const createTicketRoute = {
  path: '/users/:userId/tickets',
  method: 'post',
  middleware: [upload.single('image'), verifyAuthToken],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const tickets = ticketsCollection()
      const users = usersCollection()

      if (!tickets || !users) {
        console.log('⚠️ Database connection not initialized')
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      const { userId } = req.params

      if (authUser.uid !== userId) {
        console.log('⚠️ Unauthorized access attempt:', {
          userId,
          authUserId: authUser.uid,
        })
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { title, content } = req.body
      if (!title?.trim() || !content?.trim()) {
        console.log('⚠️ Validation failed:', { title, content })
        return res.status(400).json({ error: 'Title and content are required' })
      }

      // Get the user's name
      const userDoc = await users.findOne({ id: userId })
      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' })
      }

      const userName =
        userDoc.name ||
        userDoc.displayName ||
        userDoc.email?.split('@')[0] ||
        'Unknown'

      console.log('🔍 Create Ticket Request Details:', {
        userId,
        title,
        content,
        userName,
        timestamp: new Date().toISOString(),
      })
      console.log('📸 Uploaded File:', req.file)

      const newTicketId = uuidv4()
      const image = req.file
        ? `${process.env.API_URL || 'http://localhost:8090'}/uploads/${
            req.file.filename
          }`
        : null

      const newTicket = {
        id: newTicketId,
        title: title.trim(),
        content: content.trim(),
        image,
        createdBy: userId,
        userName, // 👈 Include userName here
        createdAt: new Date(),
        comments: [],
      }

      const session = tickets.client.startSession()
      let response
      try {
        await session.withTransaction(async () => {
          const result = await tickets.insertOne(newTicket)
          const mongoId = result.insertedId

          const userUpdateResult = await users.updateOne(
            { id: userId },
            { $push: { tickets: newTicketId } }
          )
          if (userUpdateResult.modifiedCount === 0) {
            console.log('⚠️ Failed to update user with new ticket:', {
              userId,
              ticketId: newTicketId,
            })
            throw new Error('Failed to update user with new ticket')
          }

          await logActivity(
            'created-ticket',
            `Created a new ticket #${newTicketId}`,
            userId,
            newTicketId
          )

          response = {
            ...newTicket,
            _id: mongoId.toString(),
            createdAt: newTicket.createdAt.toISOString(),
          }

          console.log('✅ Ticket created successfully:', response)
        })
      } finally {
        await session.endSession()
      }

      res.status(201).json(response)
    } catch (error) {
      console.error('❌ Error in create ticket route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to create ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { createTicketRoute }
