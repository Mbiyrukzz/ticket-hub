import { ticketsCollection } from '../db.js'

export const ticketslistRoutes = {
  path: '/tickets',
  method: 'get',
  handler: async (req, res) => {
    try {
      const tickets = await ticketsCollection
        .aggregate([
          {
            $lookup: {
              from: 'comments',
              localField: 'id', // Ticket's id
              foreignField: 'ticketId', // Comment's ticketId
              as: 'comments',
            },
          },
        ])
        .toArray()
      console.log('✅ Fetched tickets:', tickets)
      res.status(200).json(tickets)
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      res.status(500).json({ error: 'Failed to fetch tickets' })
    }
  },
}
