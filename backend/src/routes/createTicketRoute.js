import { v4 as uuidv4 } from 'uuid'
import { ticketsCollection } from '../db.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })

export const createTicketRoute = {
  path: '/tickets',
  method: 'post',
  middleware: [upload.single('image')], // Properly apply Multer
  handler: async (req, res) => {
    try {
      console.log('📥 Incoming Data:', req.body)
      console.log('📸 Uploaded File:', req.file)

      const { title, content } = req.body
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      const image = req.file
        ? `http://localhost:8080/uploads/${req.file.filename}`
        : null

      const newTicket = { id: uuidv4(), title, content, image } // Use _id
      await ticketsCollection.insertOne(newTicket)

      res.status(201).json(newTicket)
    } catch (error) {
      console.error('❌ Error creating ticket:', error)
      res.status(500).json({ error: 'Failed to create ticket' })
    }
  },
}
