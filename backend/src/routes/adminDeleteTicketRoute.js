const path = require('path')
const fs = require('fs')
const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { isAdmin } = require('../middleware/isAdmin.js')
const logActivity = require('../middleware/logActivity.js')

const adminDeleteTicketRoute = {
  path: '/admins/:userId/tickets/:ticketId',
  method: 'delete',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const userDoc = req.userDoc
      const { ticketId } = req.params

      const tickets = ticketsCollection()
      const users = usersCollection()

      if (!userDoc.isAdmin) {
        return res.status(403).json({ error: 'Only admins can delete tickets' })
      }

      const ticket = await tickets.findOne({ id: ticketId })
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' })
      }

      // Delete the image from disk if present
      if (ticket.image) {
        const imagePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(ticket.image)
        )
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      const session = tickets.client.startSession()
      let deletionResult

      try {
        await session.withTransaction(async () => {
          deletionResult = await tickets.deleteOne({ id: ticketId })

          await users.updateOne(
            { id: ticket.createdFor },
            { $pull: { tickets: ticketId } }
          )

          await logActivity(
            'ticket-deleted',
            `Admin deleted ticket #${ticketId}`,
            authUser.uid,
            ticketId
          )
        })
      } finally {
        await session.endSession()
      }

      if (deletionResult.deletedCount === 0) {
        return res.status(400).json({ error: 'Failed to delete ticket' })
      }

      // 🔄 Emit real-time event
      const io = req.app.get('io')
      if (io) {
        io.emit('ticket-deleted', { id: ticketId })
      }

      return res.status(200).json({ success: true, id: ticketId })
    } catch (error) {
      console.error('❌ Admin ticket deletion error:', error.message)
      return res
        .status(500)
        .json({ error: 'Failed to delete ticket', details: error.message })
    }
  },
}

module.exports = { adminDeleteTicketRoute }
