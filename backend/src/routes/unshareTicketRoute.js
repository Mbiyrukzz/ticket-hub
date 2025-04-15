const { ticketsCollection, activitiesCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

const unShareTicketRoute = {
  path: '/users/:userId/tickets/:ticketId/unshare-ticket',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    const { ticketId } = req.params
    const { email } = req.body // Email of the user to unshare with
    const user = req.user // From verifyAuthToken middleware

    // Validate request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    try {
      // Update the ticket by removing the email from sharedWith
      const result = await ticketsCollection().findOneAndUpdate(
        { id: ticketId },
        {
          $pull: { sharedWith: { email } }, // Remove the email from sharedWith array
        },
        { returnDocument: 'after' }
      )

      if (!result.value) {
        return res
          .status(404)
          .json({ message: `Ticket with ID ${ticketId} not found` })
      }

      const updatedTicket = result.value

      // Log the unsharing action
      await activitiesCollection().insertOne({
        userId: user.uid,
        ticketId,
        action: 'unshare',
        targetEmail: email,
        timestamp: new Date(),
      })

      res.status(200).json(updatedTicket.sharedWith || [])
    } catch (error) {
      console.error('Error unsharing ticket:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to unshare ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { unShareTicketRoute }
