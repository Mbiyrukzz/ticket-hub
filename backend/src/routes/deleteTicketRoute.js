const path = require('path')
const fs = require('fs')
const admin = require('firebase-admin')
const { ticketsCollection, usersCollection } = require('../db.js')

const deleteTicketRoute = {
  path: '/users/:userId/tickets/:ticketId',
  method: 'delete',
  handler: async (req, res) => {
    try {
      // Extract token from Authorization header
      const authtoken = req.headers.authtoken?.replace('Bearer ', '')
      if (!authtoken) {
        console.log('No auth token provided in headers:', req.headers)
        return res
          .status(401)
          .json({ error: 'No authentication token provided' })
      }

      console.log('🔍 Verifying token:', authtoken)
      const authUser = await admin.auth().verifyIdToken(authtoken)

      const tickets = ticketsCollection()
      const users = usersCollection()

      const { ticketId, userId } = req.params
      console.log('🔍 Delete Request Details:', {
        userId,
        ticketId,
        timestamp: new Date().toISOString(),
      })

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      if (ticket.createdBy !== authUser.uid) {
        return res.sendStatus(403)
      }

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

      await tickets.deleteOne({ id: ticketId })
      console.log('✅ Ticket deleted from collection')

      const userUpdateResult = await users.updateOne(
        { id: ticket.createdBy },
        { $pull: { tickets: ticket.id } }
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
