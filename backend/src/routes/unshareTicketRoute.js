const { ticketsCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

const unShareTicketRoute = {
  path: '/tickets/:ticketId/unshare-ticket/:email',
  method: 'delete',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    const { email, ticketId } = req.params

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

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

    return res.status(200).json({ ticket: updatedTicket.sharedWith })
  },
}

module.exports = { unShareTicketRoute }
