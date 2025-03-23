import path from 'path'
import fs from 'fs'
import multer from 'multer'
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
      const { id } = req.params
      const { title, content } = req.body

      // Query using UUID instead of MongoDB ObjectId
      const ticket = await ticketsCollection.findOne({ id }) // ✅ Corrected to match UUID
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

      const updatedTicket = { title, content, image: updatedImage }

      // ✅ Update using UUID
      await ticketsCollection.updateOne({ id }, { $set: updatedTicket })

      res.json({ id, ...updatedTicket })
    } catch (error) {
      console.error('❌ Error updating ticket:', error)
      res.status(500).json({ error: 'Failed to update ticket' })
    }
  },
}
