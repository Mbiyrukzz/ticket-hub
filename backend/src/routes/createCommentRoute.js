const { commentsCollection, ticketsCollection } = require('../db.js')
const { v4: uuidv4 } = require('uuid')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads') // ✅ Ensure images are in main 'uploads' folder
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

const createCommentRoute = {
  path: '/users/:userId/tickets/:ticketId/comments',
  method: 'post',
  handler: [
    upload.single('image'),
    async (req, res) => {
      try {
        const comments = commentsCollection()
        const tickets = ticketsCollection()

        if (!comments || !tickets) {
          console.error('❌ Database not initialized')
          return res.status(500).json({ error: 'Database not initialized' })
        }

        const { ticketId } = req.params
        const { content, author } = req.body
        const imageUrl = req.file
          ? `http://localhost:8080/uploads/${req.file.filename}`
          : null

        console.log('🔹 Incoming request to add comment:', {
          ticketId,
          content,
          author,
          imageUrl,
        })

        // Validate that the ticket exists
        const ticket = await tickets.findOne({ id: ticketId })
        if (!ticket) {
          return res.status(404).json({ error: 'Ticket not found' })
        }

        if (!content || typeof content !== 'string' || content.trim() === '') {
          return res
            .status(400)
            .json({ error: 'Comment content must be a non-empty string' })
        }

        const newComment = {
          id: uuidv4(),
          ticketId, // ✅ Now correctly associates with ticket IDs
          content: content.trim(),
          author: author || 'Anonymous',
          imageUrl,
          createdAt: new Date().toISOString(),
        }

        console.log('📝 Creating new comment:', newComment)

        const result = await comments.insertOne(newComment)

        if (!result.acknowledged) {
          console.error('❌ MongoDB insert failed')
          return res.status(500).json({ error: 'Failed to save comment' })
        }

        // Update ticket with the new comment ID
        await tickets.updateOne(
          { id: ticketId },
          { $push: { comments: newComment.id } }
        )

        console.log('✅ Comment created:', {
          _id: result.insertedId,
          ...newComment,
        })

        res.status(201).json({ _id: result.insertedId, ...newComment })
      } catch (error) {
        console.error('❌ Error creating comment:', error.message, error.stack)
        res
          .status(500)
          .json({ error: 'Failed to create comment', details: error.message })
      }
    },
  ],
}

module.exports = { createCommentRoute }
