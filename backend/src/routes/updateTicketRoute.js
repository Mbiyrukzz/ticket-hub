const path = require('path')
const fs = require('fs')
const multer = require('multer')

const admin = require('firebase-admin')
const { ticketsCollection } = require('../db.js')

// Multer Storage Configuration (same as create)
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
  path: '/users/:userId/tickets/:ticketId', // Changed to match create pattern
  method: 'put',
  middleware: [upload.single('image')],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const tickets = ticketsCollection()
      if (!tickets)
        return res.status(500).json({ error: 'Database not initialized' })

      const { userId, ticketId } = req.params // Now extracting userId too
      const { title, content } = req.body

      // Find ticket by ticketId and verify it belongs to userId
      const ticket = await tickets.findOne({ id: ticketId, createdBy: userId })
      if (ticket.createdBy !== authUser.uid)
        return res.status(403).json({ error: 'Ticket not owned by user' })

      const updateFields = {}
      if (title && title !== ticket.title) updateFields.title = title
      if (content && content !== ticket.content) updateFields.content = content

      if (req.file) {
        if (ticket.image) {
          const oldImagePath = path.join(
            __dirname,
            '..',
            'uploads',
            path.basename(
              ticket.image.replace('http://localhost:8080/uploads/', '')
            )
          )
          if (fs.existsSync(oldImagePath)) {
            await fs.promises.unlink(oldImagePath)
            console.log('🗑️ Old image deleted')
          } else {
            console.warn('⚠️ Old image not found at:', oldImagePath)
          }
        }
        updateFields.image = `http://localhost:8080/uploads/${req.file.filename}`
      }

      if (Object.keys(updateFields).length === 0)
        return res.status(200).json(ticket)

      const result = await tickets.updateOne(
        { id: ticketId, createdBy: userId }, // Ensure user owns ticket
        { $set: updateFields }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Ticket not found during update' })
      }

      const updatedTicket = await tickets.findOne({ id: ticketId })
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
