const {
  commentsCollection,
  usersCollection,
  ticketsCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { v4: uuidv4 } = require('uuid')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ✅ Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads')
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
  path: '/tickets/:ticketId/comments',
  method: 'post',
  middleware: [verifyAuthToken, upload.single('image')],
  handler: async (req, res) => {
    const { ticketId } = req.params
    const authUser = req.user
    const { content, parentId } = req.body

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' })
    }

    try {
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      const users = usersCollection()

      const [ticket, user] = await Promise.all([
        tickets.findOne({ id: ticketId }),
        users.findOne({ id: authUser.uid }),
      ])

      if (!ticket) return res.status(404).json({ error: 'Ticket not found' })
      if (!user) return res.status(404).json({ error: 'User not found' })

      const isOwner = ticket.createdBy === authUser.uid
      const isAssigned = ticket.createdFor === authUser.uid
      const isShared = ticket.sharedWith?.some(
        (u) => u.email.toLowerCase() === authUser.email.toLowerCase()
      )
      const isAdmin = user.isAdmin

      if (!isOwner && !isAssigned && !isShared && !isAdmin) {
        return res
          .status(403)
          .json({ error: 'Unauthorized to comment on this ticket' })
      }

      const newComment = {
        id: uuidv4(),
        ticketId,
        userId: authUser.uid,
        userName: user.name || user.userName || 'Unknown User',
        content: content.trim(),
        parentId: parentId || null,
        createdAt: new Date().toISOString(),
        imageUrl: req.file
          ? `${process.env.API_URL || 'http://localhost:8090'}/uploads/${
              req.file.filename
            }`
          : null,
      }

      await comments.insertOne(newComment)

      // ✅ Real-time update to all users in the same ticket room
      const io = req.app.get('io')
      if (io) {
        io.to(ticketId).emit('comment-added', newComment)
      }

      return res
        .status(201)
        .json({ message: 'Comment added', comment: newComment })
    } catch (error) {
      console.error('Error posting comment:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { createCommentRoute }
