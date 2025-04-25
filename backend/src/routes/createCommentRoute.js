const { commentsCollection, ticketsCollection } = require('../db.js')
const { v4: uuidv4 } = require('uuid')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userCanEditTicket } = require('../middleware/userCanEditTicket.js')

const logActivity = require('../middleware/logActivity.js')

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(__dirname, '..', 'uploads')
      await fs.mkdir(uploadPath, { recursive: true })
      cb(null, uploadPath)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)
    if (extname && mimetype) return cb(null, true)
    cb(new Error('Only images (jpeg, jpg, png) are allowed'))
  },
})

const validateComment = (req, res, next) => {
  const { content } = req.body
  if (!content?.trim()) {
    return res.status(400).json({ error: 'Comment content is required' })
  }
  next()
}

const createCommentRoute = {
  path: '/users/:userId/tickets/:ticketId/comments',
  method: 'post',
  middleware: [upload.single('image'), verifyAuthToken, userCanEditTicket],
  handler: async (req, res) => {
    let tempFile
    try {
      const authUser = req.user
      const { userId, ticketId } = req.params
      const { content, author } = req.body

      if (!authUser || authUser.uid !== userId) {
        console.log('⚠️ Unauthorized access attempt:', {
          userId,
          authUserId: authUser.uid,
        })
        return res.status(403).json({ error: 'Forbidden' })
      }

      const comments = commentsCollection()
      const tickets = ticketsCollection()
      if (!comments || !tickets) {
        throw new Error('Database connection not initialized')
      }

      const ticket = await tickets.findOne({ id: ticketId, createdBy: userId })
      if (!ticket) {
        console.log('⚠️ Ticket not found or unauthorized:', {
          ticketId,
          userId,
        })
        return res.status(404).json({
          error: "Ticket not found or you don't have permission",
        })
      }

      console.log('🔍 Create Comment Request Details:', {
        userId,
        ticketId,
        content,
        timestamp: new Date().toISOString(),
      })

      tempFile = req.file?.path
      const imageUrl = req.file
        ? `${process.env.BASE_URL || 'http://localhost:8080'}/uploads/${
            req.file.filename
          }`
        : null

      const newComment = {
        id: uuidv4(),
        ticketId,
        content: content.trim(),
        author: author || authUser.displayName || 'Anonymous',
        imageUrl,
        createdAt: new Date(),
        createdBy: userId,
      }

      const session = comments.client.startSession()
      let response
      try {
        await session.withTransaction(async () => {
          const result = await comments.insertOne(newComment)
          await tickets.updateOne(
            { id: ticketId },
            { $push: { comments: newComment.id } }
          )

          // Log the activity after the comment is created
          await logActivity(
            'created-comment',
            `Added a new comment to ticket #${ticketId}`,
            userId,
            ticketId
          )

          response = {
            _id: result.insertedId.toString(), // Convert ObjectId to string
            ...newComment,
            createdAt: newComment.createdAt.toISOString(),
          }

          console.log('✅ Comment created successfully:', response)
        })
      } finally {
        await session.endSession()
      }

      res.status(201).json(response)
    } catch (error) {
      if (
        tempFile &&
        (await fs
          .access(tempFile)
          .then(() => true)
          .catch(() => false))
      ) {
        await fs.unlink(tempFile)
      }
      console.error('❌ Error in create comment route:', {
        message: error.message,
        stack: error.stack,
      })
      if (error instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ error: 'File upload error', details: error.message })
      }
      res.status(error.status || 500).json({
        error: 'Failed to create comment',
        details: error.message,
      })
    }
  },
}

module.exports = { createCommentRoute }
