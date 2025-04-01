const path = require('path')
const fs = require('fs')
const {
  ticketsCollection,
  usersCollection,
  commentsCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')
const logActivity = require('../middleware/logActivity.js') // Import logActivity

const deleteTicketRoute = {
  path: '/users/:userId/tickets/:ticketId',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    try {
      const tickets = ticketsCollection()
      const users = usersCollection()
      const comments = commentsCollection()

      if (!tickets || !users || !comments) {
        console.log('⚠️ Database connection not initialized')
        return res
          .status(500)
          .json({ error: 'Database connection not initialized' })
      }

      const { ticketId, userId } = req.params
      console.log('🔍 Delete Ticket Request Details:', {
        userId,
        ticketId,
        timestamp: new Date().toISOString(),
      })

      // Fetch the ticket first (already done by userOwnsTicket middleware, but we’ll fetch again for clarity)
      const ticket = await tickets.findOne({ id: ticketId, createdBy: userId })
      if (!ticket) {
        console.log('⚠️ Ticket not found or unauthorized:', {
          ticketId,
          userId,
        })
        return res
          .status(404)
          .json({ error: 'Ticket not found or you don’t have permission' })
      }

      // Delete image if exists
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

      const session = tickets.client.startSession()
      let userUpdateResult
      try {
        await session.withTransaction(async () => {
          // Delete all comments associated with the ticket
          const commentsDeleteResult = await comments.deleteMany({
            ticketId: ticketId,
          })
          console.log('✅ Deleted comments:', {
            ticketId,
            deletedCount: commentsDeleteResult.deletedCount,
          })

          // Delete the ticket from the collection
          const ticketDeleteResult = await tickets.deleteOne({
            id: ticketId,
            createdBy: userId,
          })
          if (ticketDeleteResult.deletedCount === 0) {
            console.log('⚠️ No ticket was deleted:', { ticketId, userId })
            throw new Error('Failed to delete ticket')
          }
          console.log('✅ Ticket deleted from collection')

          // Remove ticket reference from user
          userUpdateResult = await users.updateOne(
            { id: userId },
            { $pull: { tickets: ticketId } }
          )
          if (userUpdateResult.modifiedCount === 0) {
            console.log(
              '⚠️ Failed to update user by removing ticket reference:',
              { userId, ticketId }
            )
            throw new Error(
              'Failed to update user by removing ticket reference'
            )
          }
          console.log('✅ User updated by removing ticket reference')

          // Log the activity after the ticket and comments are deleted
          await logActivity(
            'deleted-ticket',
            `Deleted ticket #${ticketId}`,
            userId,
            ticketId
          )
          console.log('✅ Activity logged for deleted ticket')
        })
      } finally {
        await session.endSession()
      }

      console.log('✅ Ticket deleted successfully')
      res.status(200).json({
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
