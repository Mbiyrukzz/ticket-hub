import path from 'path'
import fs from 'fs'
import { ticketsCollection } from '../db.js'

export const deleteTicketRoute = {
  path: '/tickets/:id',
  method: 'delete',
  handler: async (req, res) => {
    try {
      const { id } = req.params

      // Find the ticket
      const ticket = await ticketsCollection.findOne({ id })
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' })

      // Delete the associated image if it exists
      if (ticket.image) {
        const imagePath = path.join(
          process.cwd(),
          'uploads',
          path.basename(ticket.image)
        )
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
      }

      // Delete the ticket from the database
      await ticketsCollection.deleteOne({ id })
      res.json({ message: 'Ticket deleted successfully', id })
    } catch (error) {
      console.error('❌ Error deleting ticket:', error)
      res.status(500).json({ error: 'Failed to delete ticket' })
    }
  },
}
