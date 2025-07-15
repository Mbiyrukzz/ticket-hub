const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const { newsCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')
const { isAdmin } = require('../middleware/isAdmin')

const uploadDir = path.join(__dirname, '../uploads/news')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${uuidv4()}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed.'))
    }
    cb(null, true)
  },
})

const adminUpdateNewsFeedPostRoute = {
  path: '/news-feed/:postId',
  method: 'put',
  middleware: [verifyAuthToken, isAdmin, upload.array('images[]')],
  handler: async (req, res) => {
    const { postId } = req.params
    const { title, content, existingImages } = req.body
    const collection = newsCollection()

    try {
      const existingPost = await collection.findOne({ id: postId })

      if (!existingPost) {
        return res.status(404).json({ error: 'News post not found' })
      }

      let images = []
      if (existingImages) {
        const parsedExisting = Array.isArray(existingImages)
          ? existingImages
          : JSON.parse(existingImages)
        images = parsedExisting
      }

      const uploadedImages =
        req.files?.map((file) => `/uploads/news/${file.filename}`) || []
      images.push(...uploadedImages)

      // Final update object
      const updateFields = {
        updatedAt: new Date(),
        ...(title && { title }),
        ...(content && { content }),
        ...(images.length > 0 && { images }),
        createdAt: existingPost.createdAt || new Date(), // ensure createdAt stays
      }

      const result = await collection.findOneAndUpdate(
        { id: postId },
        { $set: updateFields },
        { returnDocument: 'after' }
      )

      if (!result.value) {
        return res.status(404).json({ error: 'News post not found' })
      }

      // Emit socket update
      req.io?.emit('news-updated', {
        type: 'update',
        id: postId,
        post: result.value,
      })

      res.json({ success: true, post: result.value })
    } catch (err) {
      console.error('❌ Failed to update news feed post:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
}

module.exports = adminUpdateNewsFeedPostRoute
