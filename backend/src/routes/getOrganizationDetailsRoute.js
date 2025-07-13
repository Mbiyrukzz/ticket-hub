const { usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const getOrganizationDetailsRoute = {
  path: '/admins/organizations/:companyId',
  method: 'get',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    const authUser = req.user
    const { companyId } = req.params
    const { search = '', offset = 0, limit = 50 } = req.query

    // Validate and sanitize input parameters
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0)
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))

    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' })
    }

    try {
      const users = usersCollection()
      const currentUser = await users.findOne({ id: authUser.uid })
      const isAdmin = currentUser?.isAdmin === true

      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admins only' })
      }

      // Decode the company name from URL parameter
      const decodedCompanyName = decodeURIComponent(companyId)

      // Build match conditions for the specific organization
      const matchConditions = {
        $and: [
          { organization: { $exists: true } },
          { organization: { $ne: '' } },
          { organization: { $ne: null } },
          { organization: decodedCompanyName },
        ],
      }

      // Add search condition for users if provided
      if (search.trim()) {
        const searchRegex = new RegExp(
          search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'i'
        )
        matchConditions.$and.push({
          $or: [
            { name: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
          ],
        })
      }

      // Get organization summary (total user count)
      const orgSummaryPipeline = [
        {
          $match: {
            organization: decodedCompanyName,
            organization: { $exists: true, $ne: '', $ne: null },
          },
        },
        {
          $group: {
            _id: '$organization',
            totalUsers: { $sum: 1 },
          },
        },
      ]

      const orgSummary = await users.aggregate(orgSummaryPipeline).toArray()

      if (orgSummary.length === 0) {
        return res.status(404).json({
          error: 'Organization not found',
          organization: null,
          users: [],
          hasMore: false,
          pagination: {
            offset: parsedOffset,
            limit: parsedLimit,
            total: 0,
            returned: 0,
          },
        })
      }

      // Get users for this organization with pagination
      const usersPipeline = [
        { $match: matchConditions },
        { $sort: { name: 1, email: 1 } }, // Sort by name, then email
        { $skip: parsedOffset },
        { $limit: parsedLimit + 1 }, // Fetch one extra to check if there are more
        {
          $project: {
            id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            lastLoginAt: 1,
            isActive: 1,
            role: 1,
            // Add any other user fields you want to display
          },
        },
      ]

      const organizationUsers = await users.aggregate(usersPipeline).toArray()

      // Check if there are more results
      const hasMore = organizationUsers.length > parsedLimit
      if (hasMore) {
        organizationUsers.pop() // Remove the extra document
      }

      // Get total count for search results (if search is applied)
      let searchResultsCount = orgSummary[0].totalUsers
      if (search.trim()) {
        const searchCountPipeline = [
          { $match: matchConditions },
          { $count: 'total' },
        ]
        const searchCountResult = await users
          .aggregate(searchCountPipeline)
          .toArray()
        searchResultsCount = searchCountResult[0]?.total || 0
      }

      return res.status(200).json({
        organization: {
          name: decodedCompanyName,
          totalUsers: orgSummary[0].totalUsers,
        },
        users: organizationUsers,
        hasMore,
        pagination: {
          offset: parsedOffset,
          limit: parsedLimit,
          total: searchResultsCount,
          returned: organizationUsers.length,
        },
        search: search.trim() || null,
      })
    } catch (error) {
      console.error('❌ Error fetching organization details:', error)

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

module.exports = { getOrganizationDetailsRoute }
