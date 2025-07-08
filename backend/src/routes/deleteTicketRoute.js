const path = require('path')
const fs = require('fs')
const {
  ticketsCollection,
  usersCollection,
  commentsCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')
const logActivity = require('../middleware/logActivity.js')

const deleteTicketRoute = {
  path: '/users/:userId/tickets/:ticketId',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    try {
      const tickets = ticketsCollection()
      const users = usersCollection()
      const comments = commentsCollection()
      const io = req.app.get('io') // Access io like in update route

      if (!tickets || !users || !comments) {
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      const { ticketId, userId } = req.params

      const ticket = await tickets.findOne({ id: ticketId, createdBy: userId })
      if (!ticket) {
        return res
          .status(404)
          .json({ error: 'Ticket not found or not authorized' })
      }

      // 🧹 Delete associated image if present
      if (ticket.image) {
        const imagePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(ticket.image)
        )
        try {
          if (fs.existsSync(imagePath)) {
            await fs.promises.unlink(imagePath)
            console.log('🗑️ Image deleted:', imagePath)
          } else {
            console.log('⚠️ Image file not found:', imagePath)
          }
        } catch (err) {
          console.error('⚠️ Failed to delete image:', err)
        }
      }

      // 🔄 MongoDB transaction
      const session = tickets.client.startSession()
      let userUpdateResult

      try {
        await session.withTransaction(async () => {
          // ✅ Delete ticket comments
          const deletedComments = await comments.deleteMany({ ticketId })
          console.log(`🗑️ Deleted ${deletedComments.deletedCount} comments`)

          // ✅ Delete ticket document
          const deleteResult = await tickets.deleteOne({
            id: ticketId,
            createdBy: userId,
          })
          if (deleteResult.deletedCount === 0) {
            throw new Error('Ticket deletion failed')
          }

          // ✅ Remove ticket ref from user
          userUpdateResult = await users.updateOne(
            { id: userId },
            { $pull: { tickets: ticketId } }
          )
          if (userUpdateResult.modifiedCount === 0) {
            throw new Error('Failed to update user ticket reference')
          }

          // ✅ Log activity
          await logActivity(
            'deleted-ticket',
            `Deleted ticket #${ticketId}`,
            userId,
            ticketId
          )

          const io = req.app.get('io') // access io instance
          if (io) {
            io.to(ticketId).emit('ticket-deleted', {
              ticketId,
              title: ticket.title,
              deletedBy: userId,
            })
          }
        })
      } finally {
        await session.endSession()
      }

      res.status(200).json({
        message: '✅ Ticket deleted successfully',
        ticketId,
        userUpdated: userUpdateResult.modifiedCount > 0,
      })
    } catch (error) {
      console.error('❌ Error deleting ticket:', {
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
