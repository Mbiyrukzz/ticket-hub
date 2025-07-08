const http = require('http')
const socketIo = require('socket.io')
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const admin = require('firebase-admin')
const { initializeDbConnection } = require('./db.js')
const { routes } = require('./routes/index.js')
const credentials = require('../credentials.json')

// ✅ Firebase Admin Init
admin.initializeApp({ credential: admin.credential.cert(credentials) })

const app = express()
const PORT = process.env.PORT || 8090

// ✅ Basic Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ✅ Socket.IO Setup
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

// ✅ Make io available to routes via req.app.get('io')
app.set('io', io)

// ✅ Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id)

  socket.on('join-ticket-room', (ticketId) => {
    socket.join(ticketId)
    console.log(`🔁 Socket ${socket.id} joined room: ${ticketId}`)
  })

  socket.on('user-typing', ({ ticketId, userName, userId }) => {
    socket.to(ticketId).emit('user-typing', { userName, userId })
  })

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id)
  })
})

// ✅ File Upload (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`
    cb(null, filename)
  },
})
const upload = multer({ storage })

// ✅ Connect to DB & Register Routes
const start = async () => {
  try {
    await initializeDbConnection()

    routes.forEach((route) => {
      if (!route.path || !route.method || !route.handler) {
        console.error('❌ Invalid route:', route)
        return
      }

      const fullPath = `/api${route.path}`
      console.log(
        `✅ Registering route: ${route.method.toUpperCase()} ${fullPath}`
      )

      if (route.middleware) {
        app[route.method](fullPath, ...route.middleware, route.handler)
      } else {
        app[route.method](fullPath, route.handler)
      }
    })

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()

module.exports = { server, io }
