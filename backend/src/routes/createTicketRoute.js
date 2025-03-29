const { v4: uuidv4 } = require('uuid')

const { ticketsCollection, usersCollection } = require('../db.js')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads') // ✅ Moves out of 'routes' to main folder
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
      if (!tickets) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      console.log('📥 Incoming Data:', req.body)
      console.log('📸 Uploaded File:', req.file)

      const { userId } = req.params

      if (authUser.uid !== userId) {
        return resStatus(403)
      }
      const { title, content } = req.body
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      const newTicketId = uuidv4()
      const image = req.file
        ? `http://localhost:8080/uploads/${req.file.filename}`
        : null

      const newTicket = {
        id: newTicketId,
        title,
        content,
        image,
        createdBy: userId,
        comments: [],
      }

      // Insert the new ticket
      const result = await tickets.insertOne(newTicket)
      const mongoId = result.insertedId

      // Update user with the new ticket
      await usersCollection().updateOne(
        { id: userId },
        { $push: { tickets: newTicketId } }
      )

      res.status(201).json({ ...newTicket, _id: mongoId })
    } catch (error) {
      console.error('❌ Error creating ticket:', error)
      res.status(500).json({ error: 'Failed to create ticket' })
    }
  },
}

module.exports = { createTicketRoute }
