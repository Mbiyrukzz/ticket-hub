const { v4: uuidv4 } = require('uuid')
const { usersCollection, newsCollection } = require('../db.js')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { isAdmin } = require('../middleware/isAdmin.js')

// Setup Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  },
})
const upload = multer({ storage })

const adminCreatePostRoute = {
  path: '/news-feed',
  method: 'post',
  middleware: [upload.array('images'), verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const users = usersCollection()
      const news = newsCollection()

      const { title, content } = req.body

      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      const imageFiles = req.files || []
      const imageUrls = imageFiles.map((file) => {
        return `${process.env.API_URL || 'http://localhost:8090'}/uploads/${
          file.filename
        }`
      })
      const authorInfo = await users.findOne({ id: authUser.uid })
      const authorName =
        authorInfo?.name ||
        authorInfo?.displayName ||
        authorInfo?.email?.split('@')[0] ||
        'Admin'

      const post = {
        id: uuidv4(),
        title: title.trim(),
        content: content.trim(),
        images: imageUrls,
        createdBy: authUser.uid,
        authorName,
        createdAt: new Date(),
      }

      const result = await news.insertOne(post)
      const insertedPost = { ...post, _id: result.insertedId.toString() }

      // 🔄 Emit to all users if using real-time
      const io = req.app.get('io')
      if (io) {
        io.emit('news-created', insertedPost)
      }

      return res.status(201).json(insertedPost)
    } catch (error) {
      console.error('❌ Failed to create news post:', error.message)
      return res.status(500).json({
        error: 'Failed to create news post',
        details: error.message,
      })
    }
  },
}

module.exports = { adminCreatePostRoute }
