const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { ObjectId } = require('mongodb')
const { ticketsCollection } = require('../db.js')

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })

const updateTicketRoute = {
  path: '/tickets/:id',
  method: 'put',
  middleware: [upload.single('image')],
  handler: async (req, res) => {
    console.log('📥 Incoming Data:', req.body)
    console.log('📸 Uploaded File:', req.file)

    try {
      const tickets = ticketsCollection() // Call the function if using the first db.js version
      if (!tickets) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      let { id } = req.params
      console.log('🆔 Received ID:', id, 'Type:', typeof id)

      // Convert id if necessary
      const objectId = ObjectId.isValid(id) ? new ObjectId(id) : id

      const { title, content } = req.body

      // Find the existing ticket
      const ticket = await tickets.findOne({ id: objectId })
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' })

      let updatedImage = ticket.image
      if (req.file) {
        // Delete old image if it exists
        if (ticket.image) {
          const oldImagePath = path.join(
            __dirname,
            'uploads',
            path.basename(ticket.image)
          )
          fs.access(oldImagePath, fs.constants.F_OK, (err) => {
            if (!err) {
              fs.unlink(oldImagePath, (unlinkErr) => {
                if (unlinkErr)
                  console.error('❌ Error deleting old image:', unlinkErr)
                else console.log('🗑️ Old image deleted successfully')
              })
            }
          })
        }

        // Save new image URL
        updatedImage = `http://localhost:8080/uploads/${req.file.filename}`
      }

      // Define updated fields dynamically (only update if provided)
      const updatedFields = {}
      if (title) updatedFields.title = title
      if (content) updatedFields.content = content
      if (req.file) updatedFields.image = updatedImage

      // ✅ Update ticket in MongoDB
      const updatedTicket = await tickets.findOneAndUpdate(
        { id: objectId },
        { $set: updatedFields },
        { returnDocument: 'after', returnOriginal: false }
      )

      console.log('🔄 Updated Ticket:', updatedTicket)
      if (!updatedTicket)
        return res.status(500).json({ error: 'Failed to update ticket' })

      res.json(updatedTicket)
    } catch (error) {
      console.error('❌ Error updating ticket:', error.message, error.stack)
      res
        .status(500)
        .json({ error: 'Failed to update ticket', details: error.message })
    }
  },
}

module.exports = { updateTicketRoute }
