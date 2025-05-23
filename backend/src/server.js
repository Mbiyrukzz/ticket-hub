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
const { verifyAuthToken } = require('./middleware/verifyAuthToken.js')

admin.initializeApp({ credential: admin.credential.cert(credentials) })

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(
  cors({
    origin: 'https://support.ashmif.com || http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],

    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from MERN backend' })
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const server = http.createServer(app)

const io = socketIo(server)

io.on('connection', (socket) => {
  console.log('New client has connected')
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    console.log('📂 Saving file to:', uploadPath) // Debug log
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`
    console.log('📸 Filename:', filename) // Debug log
    cb(null, filename)
  },
})

const upload = multer({ storage })

// Database Connection & Routes
const start = async () => {
  try {
    await initializeDbConnection()
    routes.forEach((route) => {
      if (!route.path || !route.method || !route.handler) {
        console.error('❌ Invalid route definition:', route)
        return
      }

      console.log(
        `✅ Registering route: ${route.method.toUpperCase()} ${route.path}`
      )
      if (route.middleware) {
        app[route.method](route.path, ...route.middleware, route.handler)
      } else {
        app[route.method](route.path, route.handler)
      }
    })

    // Start server
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  } catch (error) {
    console.error('❌ Error connecting to the database:', error)
    process.exit(1)
  }
}

start()
