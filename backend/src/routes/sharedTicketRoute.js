const {
  ticketsCollection,
  usersCollection,
  activitiesCollection,
} = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')
const { sendEmail } = require('../utils/sendEmail.js')
const sanitizeHtml = require('sanitize-html')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sharedTicketRoute = {
  path: '/users/:userId/tickets/:ticketId/share-ticket',
  method: 'post',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {
    const user = req.user
    const { ticketId } = req.params
    const { email, optionalMessage } = req.body

    // Validate request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Prevent self-sharing
    if (email === user.email) {
      return res
        .status(400)
        .json({ message: 'You cannot share the ticket with yourself' })
    }

    // Sanitize optionalMessage to prevent XSS
    const sanitizedMessage = optionalMessage
      ? sanitizeHtml(optionalMessage, {
          allowedTags: [], // Disallow all HTML tags
          allowedAttributes: {}, // Disallow all attributes
        })
      : undefined

    try {
      // Check if the user with the email exists
      const userWithEmail = await usersCollection().findOne({ email })
      if (!userWithEmail) {
        return res
          .status(404)
          .json({ message: `User with email ${email} not found` })
      }

      // Extract name, default to email if name is missing
      const name = userWithEmail.name || email

      // Update the ticket
      const result = await ticketsCollection().findOneAndUpdate(
        { id: ticketId },
        {
          $addToSet: {
            sharedWith: { email, optionalMessage: sanitizedMessage, name },
          },
        },
        { returnDocument: 'after' }
      )

      if (!result.value) {
        return res
          .status(404)
          .json({ message: `Ticket with ID ${ticketId} not found` })
      }

      const updatedEmails = result.value

      // Log the sharing action
      await activitiesCollection().insertOne({
        userId: user.uid,
        ticketId,
        action: 'share',
        targetEmail: email,
        optionalMessage: sanitizedMessage,
        timestamp: new Date(),
      })

      // Send email notification to the shared user
      const ticketLink = `${process.env.APP_URL}/tickets/${ticketId}`
      await sendEmail({
        to: email,
        subject: 'A Ticket Has Been Shared With You',
        text: `You have been shared a ticket.\n\n${
          sanitizedMessage ? `Message: ${sanitizedMessage}\n\n` : ''
        }View the ticket here: ${ticketLink}`,
        html: `
          <h2>A Ticket Has Been Shared With You</h2>
          ${
            sanitizedMessage
              ? `<p><strong>Message:</strong> ${sanitizedMessage}</p>`
              : ''
          }
          <p><a href="${ticketLink}">View the ticket</a></p>
        `,
      })

      res.status(200).json(updatedEmails.sharedWith || [])
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
