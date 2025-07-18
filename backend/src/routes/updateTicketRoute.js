const path = require('path')
const fs = require('fs')
const multer = require('multer')

const { ticketsCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userCanEditTicket } = require('../middleware/userCanEditTicket.js')

// Multer Storage Configuration
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

const updateTicketRoute = {
  path: '/users/:userId/tickets/:ticketId',
  method: 'put',
  middleware: [upload.single('image'), verifyAuthToken, userCanEditTicket],
  handler: async (req, res) => {
    try {
      const tickets = ticketsCollection()
      if (!tickets) {
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { userId, ticketId } = req.params
      const { title, content } = req.body

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      const updateFields = {}
      if (title && title !== ticket.title) updateFields.title = title
      if (content && content !== ticket.content) updateFields.content = content

      // 🔄 Replace old image if a new one is uploaded
      if (req.file) {
        if (ticket.image) {
          const oldImagePath = path.join(
            __dirname,
            '..',
            'uploads',
            path.basename(ticket.image.replace(/.*\/uploads\//, ''))
          )
          if (fs.existsSync(oldImagePath)) {
            await fs.promises.unlink(oldImagePath)
            console.log('🗑️ Old image deleted')
          } else {
            console.warn('⚠️ Old image not found:', oldImagePath)
          }
        }

        updateFields.image = `${
          process.env.API_URL || 'http://localhost:8090'
        }/uploads/${req.file.filename}`
      }

      // ✅ If no changes, return current ticket
      if (Object.keys(updateFields).length === 0) {
        return res.status(200).json(ticket)
      }

      // ⏫ Update ticket
      const result = await tickets.updateOne(
        { id: ticketId },
        { $set: updateFields }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Ticket not found during update' })
      }

      const updatedTicket = await tickets.findOne({ id: ticketId })

      // ✅ Emit real-time update via Socket.IO
      const io = req.app.get('io') // Access io instance from Express
      if (io) {
        io.to(ticketId).emit('ticket-updated', updatedTicket)
        console.log('📡 Emitted ticket-updated for:', ticketId)
      }

      res.status(200).json(updatedTicket)
    } catch (error) {
      console.error('❌ Error updating ticket:', error)
      res
        .status(500)
        .json({ error: 'Failed to update ticket', details: error.message })
    }
  },
}

module.exports = { updateTicketRoute }
