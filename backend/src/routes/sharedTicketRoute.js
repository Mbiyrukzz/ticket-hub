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
    const authUser = req.user
    const { ticketId } = req.params
    const { email, optionalMessage, role } = req.body

    // Validate request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate role
    if (!role || !['view', 'edit'].includes(role)) {
      return res
        .status(400)
        .json({ message: 'Role is required and must be "view" or "edit"' })
    }

    // Prevent self-sharing
    if (email === authUser.email) {
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
      : ''

    try {
      // Check if the user with the email exists
      const userWithEmail = await usersCollection().findOne({ email })
      if (!userWithEmail) {
        return res
          .status(404)
          .json({ message: `User with email ${email} not found` })
      }

      // Check if email is already shared
      const ticket = await ticketsCollection().findOne({ id: ticketId })
      if (ticket.sharedWith?.some((setting) => setting.email === email)) {
        return res
          .status(400)
          .json({ message: 'This email is already shared with the ticket' })
      }

      // Extract name, default to email if name is missing
      const name = userWithEmail.name || email

      // Update the ticket
      const result = await ticketsCollection().findOneAndUpdate(
        { id: ticketId },
        {
          $push: {
            sharedWith: {
              id: userWithEmail.id,
              email,
              optionalMessage: sanitizedMessage,
              name,
              role, // Role is now validated
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

      const updatedTicket = result.value

      // Log the sharing action
      await activitiesCollection().insertOne({
        userId: authUser.uid, // Use authUser.uid
        ticketId,
        action: 'share',
        targetEmail: email,
        role, // Log the role
        optionalMessage: sanitizedMessage,
        timestamp: new Date(),
      })

      // Send email notification to the shared user
      const ticketLink = `${process.env.APP_URL}/tickets/${ticketId}`
      await sendEmail({
        to: email,
        subject: 'A Ticket Has Been Shared With You',
        text: `You have been shared a ticket with ${role} access.\n\n${
          sanitizedMessage ? `Message: ${sanitizedMessage}\n\n` : ''
        }View the ticket here: ${ticketLink}`,
        html: `
          <h2>A Ticket Has Been Shared With You</h2>
          <p><strong>Access Level:</strong> ${
            role.charAt(0).toUpperCase() + role.slice(1)
          }</p>
          ${
            sanitizedMessage
              ? `<p><strong>Message:</strong> ${sanitizedMessage}</p>`
              : ''
          }
          <p><a href="${ticketLink}">View the ticket</a>'
        `,
      })

      res.status(200).json(updatedTicket.sharedWith || [])
    } catch (error) {
      console.error('Error sharing ticket:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to share ticket',
      })
    }
  },
}

module.exports = { sharedTicketRoute }
