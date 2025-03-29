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

console.log('Firebase Credentials:', credentials)

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // ✅ Supports form-data requests

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
    await initializeDbConnection() // Properly placed inside try block

    routes.forEach((route) => {
      if (route.middleware) {
        app[route.method](
          route.path,
          ...route.middleware,
          verifyAuthToken,
          route.handler
        )
      } else {
        app[route.method](route.path, verifyAuthToken, route.handler)
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
