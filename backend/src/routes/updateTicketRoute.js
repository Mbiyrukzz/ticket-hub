import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { ObjectId } from 'mongodb'
import { ticketsCollection } from '../db.js'

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

export const updateTicketRoute = {
  path: '/tickets/:id',
  method: 'put',
  middleware: [upload.single('image')],
  handler: async (req, res) => {
    console.log('📥 Incoming Data:', req.body)
    console.log('📸 Uploaded File:', req.file)

    try {
      let { id } = req.params
      console.log('🆔 Received ID:', id, 'Type:', typeof id)

      // Convert id if necessary
      const objectId = ObjectId.isValid(id) ? new ObjectId(id) : id

      const { title, content } = req.body

      // Find the existing ticket
      const ticket = await ticketsCollection.findOne({ id: objectId })
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' })

      let updatedImage = ticket.image
      if (req.file) {
        // Delete old image if it exists
        if (ticket.image) {
          const oldImagePath = path.join(
            process.cwd(),
            'uploads',
            path.basename(ticket.image)
          )
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
        }
        updatedImage = `http://localhost:8080/uploads/${req.file.filename}`
      }

      // Define updated fields dynamically (only update if provided)
      const updatedFields = {}
      if (title) updatedFields.title = title
      if (content) updatedFields.content = content
      if (req.file) updatedFields.image = updatedImage

      // ✅ Update ticket in MongoDB
      const updatedTicket = await ticketsCollection.findOneAndUpdate(
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
