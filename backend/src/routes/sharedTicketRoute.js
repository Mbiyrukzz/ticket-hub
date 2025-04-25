const { ticketsCollection, usersCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sharedTicketRoute = {
  path: '/tickets/:ticketId/share-ticket',
  method: 'post',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    const authUser = req.user
    const { ticketId } = req.params
    const { email, role } = req.body

    // Validate request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (email === authUser.email) {
      return res
        .status(400)
        .json({ message: 'You cannot share the ticket with yourself' })
    }

    const userWithEmail = await usersCollection().findOne({ email })
    if (!userWithEmail) {
      return res
        .status(404)
        .json({ message: `User with email ${email} not found` })
    }

    try {
      const result = await ticketsCollection().findOneAndUpdate(
        { id: ticketId },
        {
          $addToSet: {
            sharedWith: {
              email,
              role,
            },
          },
        },
        { returnDocument: 'after' }
      )

      if (!result.value) {
        return res
          .status(404)
          .json({ message: `Ticket with ID ${ticketId} not found` })
      }

      console.log('Updated ticket:', result.value) // Debug
      res.status(200).json(result.value.sharedWith || [])
    } catch (error) {
      console.error('Error sharing ticket:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to share ticket',
        details: error.message,
      })
    }
  },
}

module.exports = { sharedTicketRoute }
