const { usersCollection } = require('../db')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const getOrganizationsRoute = {
  path: '/admins/organizations',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const authUser = req.user
    const { search = '', offset = 0, limit = 20 } = req.query

    // Validate and sanitize input parameters
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0)
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const users = usersCollection()
      const currentUser = await users.findOne({ id: authUser.uid })
      const isAdmin = currentUser?.isAdmin === true

      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admins only' })
      }

      // Build match conditions
      const matchConditions = {
        $and: [
          { organization: { $exists: true } },
          { organization: { $ne: '' } },
          { organization: { $ne: null } },
        ],
      }

      // Add search condition if provided
      if (search.trim()) {
        matchConditions.$and.push({
          organization: {
            $regex: new RegExp(
              search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i'
            ),
          },
        })
      }

      const pipeline = [
        {
          $match: matchConditions,
        },
        {
          $group: {
            _id: '$organization',
            count: { $sum: 1 },
            // Optional: Get sample users for each organization
            sampleUsers: {
              $push: {
                id: '$id',
                name: '$name',
                email: '$email',
              },
            },
          },
        },
        {
          $addFields: {
            // Limit sample users to first 3
            sampleUsers: { $slice: ['$sampleUsers', 3] },
          },
        },
        { $sort: { _id: 1 } },
        { $skip: parsedOffset },
        { $limit: parsedLimit + 1 }, // Fetch one extra to check if there are more
      ]

      const organizations = await users.aggregate(pipeline).toArray()

      // Check if there are more results
      const hasMore = organizations.length > parsedLimit
      if (hasMore) {
        organizations.pop() // Remove the extra document
      }

      // Format the results
      const results = organizations.map((org) => ({
        name: org._id,
        userCount: org.count,
        sampleUsers: org.sampleUsers || [],
      }))

      // Get total count for pagination info (optional)
      const totalCountPipeline = [
        {
          $match: matchConditions,
        },
        {
          $group: {
            _id: '$organization',
          },
        },
        {
          $count: 'total',
        },
      ]

      const totalCountResult = await users
        .aggregate(totalCountPipeline)
        .toArray()
      const totalCount = totalCountResult[0]?.total || 0

      return res.status(200).json({
        organizations: results,
        hasMore,
        pagination: {
          offset: parsedOffset,
          limit: parsedLimit,
          total: totalCount,
          returned: results.length,
        },
      })
    } catch (error) {
      console.error('❌ Error fetching organizations:', error)

      // Don't expose internal error details to client
      return res.status(500).json({
        error: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
        }),
      })
    }
  },
}

module.exports = { getOrganizationsRoute }
