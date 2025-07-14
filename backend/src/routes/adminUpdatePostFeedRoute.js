const { newsCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const adminUpdateNewsFeedPostRoute = {
  path: '/news-feed/:postId',
  method: 'put',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const { postId } = req.params
    const { title, content, images } = req.body

    try {
      const collection = newsCollection()
      const result = await collection.findOneAndUpdate(
        { id: postId },
        {
          $set: {
            ...(title && { title }),
            ...(content && { content }),
            ...(images && { images }),
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      )

      if (!result.value) {
        return res.status(404).json({ error: 'News post not found' })
      }

      req.io?.emit('news-updated', result.value)

      res.json({ success: true, post: result.value })
    } catch (err) {
      console.error('❌ Failed to update news feed post:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
}

module.exports = adminUpdateNewsFeedPostRoute
