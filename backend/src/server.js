import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { initializeDbConnection } from './db.js'
import { routes } from './routes/index.js'

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // ✅ Supports form-data requests

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

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

// Database Connection & Routes
const start = async () => {
  try {
    await initializeDbConnection() // Properly placed inside try block

    routes.forEach((route) => {
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
