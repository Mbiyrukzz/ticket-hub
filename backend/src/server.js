const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { MongoClient } = require('mongodb')

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads')
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

// Database Connection & Routes
const start = async () => {
  const client = new MongoClient('mongodb://localhost:27017')
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    const ticketsCollection = client.db('tickets-app-db').collection('tickets')

    app.get('/tickets', async (req, res) => {
      const tickets = await ticketsCollection.find().toArray()
      res.json(tickets)
    })

    // Create a new ticket (with image upload)
    app.post('/tickets', upload.single('image'), async (req, res) => {
      try {
        console.log('📥 Incoming Data:', req.body)
        console.log('📸 Uploaded File:', req.file)

        const { title, content } = req.body
        if (!title || !content) {
          return res
            .status(400)
            .json({ error: 'Title and content are required' })
        }

        const image = req.file
          ? `http://localhost:8080/uploads/${req.file.filename}`
          : null
        const newTicket = { id: uuidv4(), title, content, image }
        await ticketsCollection.insertOne(newTicket)
        res.status(201).json(newTicket)
      } catch (error) {
        console.error('❌ Error creating ticket:', error)
        res.status(500).json({ error: 'Failed to create ticket' })
      }
    })

    // Update a ticket
    app.put('/tickets/:id', upload.single('image'), async (req, res) => {
      console.log('📥 Incoming Data:', req.body)
      console.log('📸 Uploaded File:', req.file)

      try {
        const { id } = req.params
        const { title, content } = req.body
        const ticket = await ticketsCollection.findOne({ id })

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' })

        let updatedImage = ticket.image
        if (req.file) {
          if (ticket.image) {
            const oldImagePath = path.join(
              __dirname,
              'uploads',
              path.basename(ticket.image)
            )
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
          }
          updatedImage = `http://localhost:8080/uploads/${req.file.filename}`
        }

        const updatedTicket = { title, content, image: updatedImage }
        await ticketsCollection.updateOne({ id }, { $set: updatedTicket })
        res.json({ id, ...updatedTicket })
      } catch (error) {
        console.error('❌ Error updating ticket:', error)
        res.status(500).json({ error: 'Failed to update ticket' })
      }
    })

    // Delete a ticket
    app.delete('/tickets/:id', async (req, res) => {
      try {
        const { id } = req.params
        const ticket = await ticketsCollection.findOne({ id })

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' })

        if (ticket.image) {
          const imagePath = path.join(
            __dirname,
            'uploads',
            path.basename(ticket.image)
          )
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
        }

        await ticketsCollection.deleteOne({ id })
        res.json({ message: 'Ticket deleted successfully', id })
      } catch (error) {
        console.error('❌ Error deleting ticket:', error)
        res.status(500).json({ error: 'Failed to delete ticket' })
      }
    })

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  } catch (error) {
    console.error('❌ Error connecting to the database:', error)
    process.exit(1)
  }
}

start()
