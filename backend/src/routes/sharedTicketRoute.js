const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

const sharedTicketRoute = {
  path: '/tickets/:ticketId/share-ticket',
  method: 'post',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    const { ticketId } = req.params
    const { email, name } = req.body

    const userWithEmail = await usersCollection().findOne({ email })

    if (!userWithEmail) {
      return res.status(404).json({ message: 'User not found' })
    }

    const result = await ticketsCollection().findOneAndUpdate(
      { id: ticketId },
      { $push: { sharedWith: email } }
    )

    const updatedNote = result.value

    res.json(updatedNote.sharedWith)
  },
}

module.exports = { sharedTicketRoute }
