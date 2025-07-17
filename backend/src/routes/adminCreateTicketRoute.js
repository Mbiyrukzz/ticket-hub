const { v4: uuidv4 } = require('uuid')
const { ticketsCollection, usersCollection } = require('../db.js')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const logActivity = require('../middleware/logActivity.js')
const { isAdmin } = require('../middleware/isAdmin.js')

// Setup Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath =
      process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads')
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

// Admin creates a ticket for a user and assigns it
const adminCreateTicketRoute = {
  path: '/admins/:userId/tickets',
  method: 'post',
  middleware: [upload.single('image'), verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const userDoc = req.userDoc
      const users = usersCollection()
      const tickets = ticketsCollection()

      if (!userDoc.isAdmin) {
        return res
          .status(403)
          .json({ error: 'Only admins can create tickets for others' })
      }

      const { title, content, priority, status, assignedTo } = req.body
      const createdFor = req.params.userId

      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      // Fetch assigned user and ensure they are an admin
      const assignedUser = await users.findOne({ id: assignedTo })
      if (!assignedUser) {
        return res.status(404).json({ error: 'Assigned user not found' })
      }
      if (!assignedUser.isAdmin) {
        return res.status(400).json({ error: 'Assigned user must be an admin' })
      }

      // Fetch created-for user and ensure they are not an admin
      const createdForUser = await users.findOne({ id: createdFor })
      if (!createdForUser) {
        return res.status(404).json({ error: 'Created-for user not found' })
      }
      if (createdForUser.isAdmin) {
        return res
          .status(400)
          .json({ error: 'Created-for user cannot be an admin' })
      }

      const assignedToName =
        assignedUser.name ||
        assignedUser.displayName ||
        assignedUser.email?.split('@')[0] ||
        'Unknown'

      const createdForName =
        createdForUser.name ||
        createdForUser.displayName ||
        createdForUser.email?.split('@')[0] ||
        'Unknown'

      const ticketId = uuidv4()
      const image = req.file
        ? `${process.env.API_URL || 'http://localhost:8090'}/uploads/${
            req.file.filename
          }`
        : null

      const newTicket = {
        id: ticketId,
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'Medium',
        image,
        status: status || 'Open',
        createdBy: authUser.uid,
        createdFor,
        createdForName,
        assignedTo,
        assignedToName,
        createdAt: new Date(),
        comments: [],
        createdByAdmin: true,
      }

      const session = tickets.client.startSession()
      let response

      try {
        await session.withTransaction(async () => {
          const result = await tickets.insertOne(newTicket)
          const mongoId = result.insertedId

          const userUpdate = await users.updateOne(
            { id: createdFor },
            { $push: { tickets: ticketId } }
          )

          if (userUpdate.modifiedCount === 0) {
            throw new Error('Failed to assign ticket to created-for user')
          }

          await logActivity(
            'user-created-ticket',
            `Admin created ticket #${ticketId}`,
            authUser.uid,
            ticketId
          )

          response = {
            ...newTicket,
            _id: mongoId.toString(),
            createdAt: newTicket.createdAt.toISOString(),
          }
        })
      } finally {
        await session.endSession()
      }

      // 🔄 Emit via Socket.IO
      const io = req.app.get('io')
      if (io) {
        io.emit('ticket-created', response)
      }

      return res.status(201).json(response)
    } catch (error) {
      console.error('❌ Admin ticket creation error:', error.message)
      return res.status(500).json({
        error: 'Failed to create ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { adminCreateTicketRoute }
