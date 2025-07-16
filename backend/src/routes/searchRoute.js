const { ticketsCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const searchRoute = {
  path: '/tickets/search',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    try {
      const user = req.user
      const tickets = ticketsCollection()

      const { q = '', status, priority, limit = 20, offset = 0 } = req.query

      const searchRegex = new RegExp(q, 'i') // Case-insensitive regex

      // Only match tickets created by or for this user
      const baseQuery = {
        $or: [{ createdBy: user.uid }, { createdFor: user.uid }],
        ...(q && {
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { id: searchRegex },
          ],
        }),
        ...(status && { status }),
        ...(priority && { priority }),
      }

      const parsedLimit = Math.min(parseInt(limit), 100)
      const parsedOffset = parseInt(offset)

      const results = await tickets
        .find(baseQuery)
        .skip(parsedOffset)
        .limit(parsedLimit)
        .sort({ createdAt: -1 })
        .toArray()

      return res.json({
        tickets: results,
        count: results.length,
      })
    } catch (error) {
      console.error('❌ Ticket search error:', error.message)
      return res.status(500).json({
        error: 'Failed to search tickets',
        details: error.message,
      })
    }
  },
}

module.exports = { searchRoute }
