const path = require('path')
const fs = require('fs')
const { ticketsCollection, usersCollection } = require('../db.js')

const deleteTicketRoute = {
  path: '/users/:userId/tickets/:ticketId', // Ensure route is correctly defined
  method: 'delete',
  handler: async (req, res) => {
    try {
      const tickets = ticketsCollection()
      const users = usersCollection()
      if (!tickets || !users) {
        console.error('❌ Database not initialized')
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { ticketId, userId } = req.params // ✅ Extract correct params
      console.log('🔍 Attempting to delete ticket with ID:', ticketId)

      // Find the ticket
      const ticket = await tickets.findOne({ id: ticketId }) // ✅ Use ticketId
      if (!ticket) {
        console.log('⚠️ Ticket not found for ID:', ticketId)
        return res.status(404).json({ error: 'Ticket not found' })
      }
      console.log('✅ Found ticket:', ticket)

      // Delete the associated image if it exists
      if (ticket.image) {
        const imagePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(ticket.image)
        )
        console.log('🛠️ Attempting to delete image at:', imagePath)

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
          console.log('🗑️ Deleted image:', imagePath)
        } else {
          console.log('⚠️ Image file not found at:', imagePath)
        }
      }

      // Delete the ticket
      const result = await tickets.findOneAndDelete({ id: ticketId }) // ✅ Use ticketId
      if (!result || !result.value) {
        console.log('⚠️ Ticket not found during deletion:', ticketId)
        return res.status(404).json({ error: 'Ticket not found' })
      }
      const deletedTicket = result.value
      console.log('✅ Deleted ticket:', deletedTicket)

      // Remove the ticket ID from the user's tickets array
      const userUpdateResult = await users.updateOne(
        { id: userId }, // ✅ Use userId from params
        { $pull: { tickets: ticketId } }
      )

      if (userUpdateResult.modifiedCount === 0) {
        console.warn(
          '⚠️ No user updated or ticket ID not found in user.tickets for user:',
          userId
        )
      } else {
        console.log('✅ Updated user tickets array for user:', userId)
      }

      res.json({ message: '✅ Ticket deleted successfully', ticketId })
    } catch (error) {
      console.error('❌ Error deleting ticket:', error)
      res.status(500).json({ error: 'Failed to delete ticket' })
    }
  },
}

module.exports = { deleteTicketRoute }
