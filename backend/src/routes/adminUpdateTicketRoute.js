const { ticketsCollection, usersCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')
const logActivity = require('../middleware/logActivity')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { io } = require('../server') // ✅ Socket.IO instance

// Setup file upload (optional image support)
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

const adminUpdateTicketRoute = {
  path: '/admins/:userId/tickets/:ticketId',
  method: 'put',
  middleware: [upload.single('image'), verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    const tickets = ticketsCollection()
    const users = usersCollection()
    const { ticketId } = req.params
    const userDoc = req.userDoc

    if (!userDoc?.isAdmin) {
      return res.status(403).json({ error: 'Only admins can update tickets' })
    }

    const {
      title,
      content,
      priority,
      status,
      assignedTo,
      assignedToName,
      createdFor,
    } = req.body

    const image = req.file
      ? `${process.env.API_URL || 'http://localhost:8090'}/uploads/${
          req.file.filename
        }`
      : undefined

    const ticket = await tickets.findOne({ id: ticketId })
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    if (ticket.status === 'Resolved') {
      return res.status(403).json({ error: 'Cannot edit a resolved ticket' })
    }

    const updates = {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(assignedTo && { assignedTo }),
      ...(assignedToName && { assignedToName }),
      ...(createdFor && { createdFor }),
      ...(image && { image }),
      updatedAt: new Date(),
    }

    try {
      await tickets.updateOne({ id: ticketId }, { $set: updates })

      await logActivity(
        'admin-updated-ticket',
        `Admin updated ticket #${ticketId}`,
        req.user.uid,
        ticketId
      )

      // 🔥 Emit to socket room
      const io = req.app.get('io')
      if (io && ticketId) {
        io.to(ticketId).emit('ticket-updated', {
          ...ticket,
          ...updates,
          id: ticketId,
        })
      }

      res.status(200).json({ message: 'Ticket updated successfully', updates })
    } catch (error) {
      console.error('❌ Ticket update failed:', error.message)
      res.status(500).json({
        error: 'Failed to update ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { adminUpdateTicketRoute }
