import { ticketsCollection } from '../db.js'
export const ticketslistRoutes = {
  path: '/tickets',
  method: 'get',
  handler: async (req, res) => {
    try {
      if (!ticketsCollection) {
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const tickets = await ticketsCollection.find().toArray()
      res.status(200).json(tickets)
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      res.status(500).json({ error: 'Failed to fetch tickets' })
    }
  },
}
