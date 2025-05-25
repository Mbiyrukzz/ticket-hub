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
    const imageFile = req.file

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' })
    }

    try {
      const tickets = ticketsCollection()
      const comments = commentsCollection()
      const users = usersCollection()

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      const isOwner = ticket.createdBy === authUser.uid
      const isShared = ticket.sharedWith?.some(
        (user) => user.email.toLowerCase() === authUser.email.toLowerCase()
      )

      if (!isOwner && !isShared) {
        return res
          .status(403)
          .json({ error: 'Unauthorized to comment on this ticket' })
      }

      const user = await users.findOne({ id: authUser.uid })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const newComment = {
        id: uuidv4(),
        ticketId,
        userId: authUser.uid,
        userName: user.name || user.userName || 'Unknown User',
        content,
        parentId: parentId || null,
        createdAt: new Date().toISOString(),
      }

      if (imageFile) {
        newComment.imageUrl = `/uploads/${imageFile.filename} || 'http://localhost:8090'`
      }

      await comments.insertOne(newComment)

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
