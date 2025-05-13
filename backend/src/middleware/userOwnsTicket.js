const { ticketsCollection } = require('../db.js')

const userOwnsTicket = async (req, res, next) => {
  try {
    const authUser = req.user // ✅ Extract user from request
    const { ticketId } = req.params
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const tickets = ticketsCollection()
    const ticket = await tickets.findOne({ id: ticketId })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    if (ticket.createdBy !== authUser.uid) {
      return res.sendStatus(403) // Forbidden
    }

    next() // ✅ User is authorized, proceed to next middleware or route
  } catch (error) {
    console.error('❌ Error in userOwnsTicket middleware:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { userOwnsTicket }
