const { newsCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const newsFeedRoute = {
  path: '/news-feed',
  method: 'get',
  middleware: [verifyAuthToken], // Remove if you want it public
  handler: async (req, res) => {
    try {
      const offset = parseInt(req.query.offset) || 0
      const limit = parseInt(req.query.limit) || 20

      // Fetch one extra item to check if there's more
      const newsItems = await newsCollection()
        .find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit + 1) // Fetch one extra for hasMore
        .toArray()

      const hasMore = newsItems.length > limit
      const limitedItems = hasMore ? newsItems.slice(0, limit) : newsItems

      return res.status(200).json({
        success: true,
        offset,
        limit,
        hasMore,
        news: limitedItems,
      })
    } catch (error) {
      console.error('❌ Error loading news feed:', error)
      return res.status(500).json({ error: 'Unable to load news feed' })
    }
  },
}

module.exports = { newsFeedRoute }
