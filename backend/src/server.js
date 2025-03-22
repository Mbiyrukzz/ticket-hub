const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { MongoClient } = require('mongodb')

const app = express()
const PORT = process.env.PORT || 8080

// ✅ Middleware
app.use(cors({ origin: 'http://localhost:5173' })) // Adjust if needed
app.use(express.json())
app.use('/uploads', express.static('uploads')) // Serve uploaded images

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads')

    // Ensure the uploads folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }) // Create if missing
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`
    cb(null, uniqueSuffix)
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

    // GET all tickets
    app.get('/tickets', async (req, res) => {
      const tickets = await ticketsCollection.find().toArray()

      res.json(tickets)
    })

    // POST a new ticket with image upload

    app.post('/tickets', upload.single('image'), async (req, res) => {
      try {
        const { title, content } = req.body
        const image = req.file
          ? `http://localhost:8080/uploads/${req.file.filename}`
          : null

        const newTicket = {
          id: uuidv4(),
          title,
          content,
          image,
        }

        await ticketsCollection.insertOne(newTicket)
        res.status(201).json(newTicket)
      } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' })
      }
    })

    app.put('/tickets/:id', upload.single('image'), async (req, res) => {
      try {
        const { id } = req.params
        const { title, content } = req.body

        // Find the existing ticket
        const ticket = await ticketsCollection.findOne({ id })
        if (!ticket) {
          return res.status(404).json({ error: 'Ticket not found' })
        }

        let updatedImage = ticket.image // Keep the existing image if no new file uploaded

        if (req.file) {
          // Delete old image from "uploads" folder
          if (ticket.image) {
            const oldImagePath = path.join(
              __dirname,
              'uploads',
              path.basename(ticket.image)
            )
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath) // Remove old image file
            }
          }

          // Set new image URL (absolute path)
          updatedImage = `http://localhost:8080/uploads/${req.file.filename}`
        }

        const updatedTicket = {
          title,
          content,
          image: updatedImage,
        }

        // Update MongoDB entry
        await ticketsCollection.updateOne({ id }, { $set: updatedTicket })

        res.json({ id, ...updatedTicket }) // Send updated ticket back
      } catch (error) {
        console.error('Error updating ticket:', error)
        res.status(500).json({ error: 'Failed to update ticket' })
      }
    })

    app.delete('/tickets/:id', async (req, res) => {
      try {
        const { id } = req.params

        // Find the ticket before deleting
        const ticket = await ticketsCollection.findOne({ id })
        if (!ticket) {
          return res.status(404).json({ error: 'Ticket not found' })
        }

        // Delete the image file if it exists
        if (ticket.image) {
          const imagePath = path.join(
            __dirname,
            'uploads',
            path.basename(ticket.image)
          )
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath) // Delete file from server
          }
        }

        // Remove the ticket from MongoDB
        await ticketsCollection.deleteOne({ id })

        res.json({ message: 'Ticket deleted successfully', id })
      } catch (error) {
        console.error('Error deleting ticket:', error)
        res.status(500).json({ error: 'Failed to delete ticket' })
      }
    })

    // ✅ Start the server only after connecting to DB
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  } catch (error) {
    console.error('❌ Error connecting to the database:', error)
    process.exit(1) // Stop the server if DB connection fails
  }
}

// ✅ Call start function to initialize DB & Server
start()
