const { ticketsCollection } = require('../db.js')
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')

const updateTicketCollaboratorsRoute = {
  path: '/users/:userId/tickets/:ticketId/collaborators',
  method: 'put',
  middleware: [verifyAuthToken],
  handler: async (req, res) => {
    try {
      const authUser = req.user
      const { userId, ticketId } = req.params
      const { collaborators } = req.body // Array of user IDs

      console.log('updateTicketCollaboratorsRoute - Request:', {
        userId,
        ticketId,
        collaborators,
      })

      // Validate authentication
      if (!authUser || !authUser.uid) {
        console.log('Auth failed: No authUser or uid')
        return res
          .status(401)
          .json({ error: 'Unauthorized: Missing or invalid token' })
      }
      if (authUser.uid !== userId) {
        console.log('Auth failed: UID mismatch', {
          authUserUid: authUser.uid,
          userId,
        })
        return res.status(403).json({ error: 'Forbidden: User ID mismatch' })
      }

      // Database connection
      const tickets = await ticketsCollection()
      if (!tickets) {
        console.error('Database collection not initialized')
        throw new Error('Database collection not initialized')
      }

      // Verify ticket exists and user is the creator
      console.log('Querying ticket:', { id: ticketId })
      const ticket = await tickets.findOne({ id: ticketId })
      console.log('Ticket found:', ticket)
      if (!ticket) {
        console.log('Ticket not found:', { ticketId })
        return res.status(404).json({ error: 'Ticket not found' })
      }
      if (ticket.userId !== userId) {
        console.log('Access denied: User not creator', { userId, ticketId })
        return res
          .status(403)
          .json({
            error:
              'Forbidden: Only the ticket creator can update collaborators',
          })
      }

      // Validate collaborators
      if (!Array.isArray(collaborators)) {
        return res
          .status(400)
          .json({ error: 'Collaborators must be an array of user IDs' })
      }

      // Update collaborators
      const result = await tickets.updateOne(
        { id: ticketId },
        { $set: { collaborators } }
      )

      if (result.modifiedCount === 0) {
        console.log('No changes made to collaborators:', { ticketId })
        return res
          .status(400)
          .json({ error: 'No changes made to collaborators' })
      }

      console.log('✅ Collaborators updated successfully:', {
        ticketId,
        collaborators,
      })
      return res
        .status(200)
        .json({ message: 'Collaborators updated successfully', collaborators })
    } catch (error) {
      console.error('❌ updateTicketCollaboratorsRoute error:', {
        message: error.message,
        stack: error.stack,
        request: { userId: req.params.userId, ticketId: req.params.ticketId },
      })
      return res.status(500).json({
        error: 'Failed to update collaborators',
        details: error.message,
      })
    }
  },
}

module.exports = { updateTicketCollaboratorsRoute }
