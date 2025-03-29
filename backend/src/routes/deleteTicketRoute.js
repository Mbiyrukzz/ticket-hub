const path = require('path')
const fs = require('fs')

const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

const deleteTicketRoute = {
  path: '/users/:userId/tickets/:ticketId',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    try {
      const tickets = ticketsCollection()
      const users = usersCollection()
      if (!tickets || !users) {
        return res.status(500).json({ error: 'Database not initialized' })
      }

      const { ticketId, userId } = req.params
      console.log('🔍 Delete Request Details:', {
        userId,
        ticketId,
        timestamp: new Date().toISOString(),
      })

      // ✅ Fetch the ticket first
      const ticket = await tickets.findOne({ id: ticketId, createdBy: userId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      // ✅ Delete image if exists
      if (ticket.image) {
        const imagePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(ticket.image)
        )
        console.log('🛠️ Attempting image deletion:', imagePath)
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
            console.log('🗑️ Image deleted successfully')
          } else {
            console.log('⚠️ Image file not found at:', imagePath)
          }
        } catch (imageError) {
          console.error('⚠️ Error deleting image:', imageError)
        }
      }

      // ✅ Delete the ticket from the collection
      await tickets.deleteOne({ id: ticketId })
      console.log('✅ Ticket deleted from collection')

      // ✅ Remove ticket reference from user
      const userUpdateResult = await users.updateOne(
        { id: userId },
        { $pull: { tickets: ticketId } }
      )

      res.json({
        message: '✅ Ticket deleted successfully',
        ticketId,
        userUpdated: userUpdateResult.modifiedCount > 0,
      })
    } catch (error) {
      console.error('❌ Error in delete ticket route:', {
        message: error.message,
        stack: error.stack,
      })
      res.status(500).json({
        error: 'Failed to delete ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { deleteTicketRoute }
