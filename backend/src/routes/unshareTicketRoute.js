const { ticketsCollection, activitiesCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

const unShareTicketRoute = {
  path: '/users/:userId/tickets/:ticketId/unshare-ticket/:email',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    const { user } = req // From verifyAuthToken middleware
    const { email, ticketId } = req.params

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    try {
      // Pull the shared user from the sharedWith array
      const result = await ticketsCollection().findOneAndUpdate(
        { id: ticketId },
        { $pull: { sharedWith: { email } } },
        { returnDocument: 'after' }
      )

      if (!result.value) {
        return res
          .status(404)
          .json({ message: `Ticket with ID ${ticketId} not found` })
      }
      const updatedTicket = result.value
      // Log the activity
      await activitiesCollection().insertOne({
        userId: user.uid,
        ticketId,
        action: 'unshare',
        targetEmail: email,
        timestamp: new Date(),
      })

      return res.status(200).json({ ticket: updatedTicket.sharedWith })
    } catch (error) {
      console.error('Error unsharing ticket:', error)
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to unshare ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { unShareTicketRoute }
