const { usersCollection } = require('../db')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir =
      process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

const updateUserProfileRoute = {
  path: '/users/:userId/profile',
  method: 'put',
  middleware: [verifyAuthToken, upload.single('avatar')],
  handler: async (req, res) => {
    const { userId } = req.params
    const authUser = req.user

    if (!authUser?.uid) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const users = usersCollection()
      const currentUser = await users.findOne({ id: authUser.uid })
      const isAdmin = currentUser?.isAdmin === true

      if (!isAdmin && authUser.uid !== userId) {
        return res
          .status(403)
          .json({ error: 'Forbidden: Not allowed to edit this profile' })
      }

      const updates = {
        name: req.body.name?.trim(),
        email: req.body.email?.trim(),
        phone: req.body.phone?.trim(),
        organization: req.body.organization?.trim(),
        position: req.body.position?.trim(),
      }

      // Clean up empty fields
      Object.keys(updates).forEach((key) => {
        if (!updates[key]) delete updates[key]
      })

      // Handle avatar upload
      if (req.file) {
        updates.avatar = `${
          process.env.API_URL || 'http://localhost:8090'
        }/uploads/${req.file.filename}`
      }

      const result = await users.updateOne({ id: userId }, { $set: updates })

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'User not updated' })
      }

      return res.status(200).json({ success: true, updates })
    } catch (error) {
      console.error('❌ Failed to update user profile:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  },
}

module.exports = { updateUserProfileRoute }
