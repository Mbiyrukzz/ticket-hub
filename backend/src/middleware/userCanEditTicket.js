const { ticketsCollection } = require('../db.js')

const userCanEditTicket = async (req, res, next) => {
  try {
    const authUser = req.user
    const { ticketId } = req.params

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const tickets = ticketsCollection()
    const ticket = await tickets.findOne({ id: ticketId })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    const isOwner = ticket.createdBy === authUser.uid
    const userPermission =
      ticket.sharedWith &&
      ticket.sharedWith.find(
        (setting) =>
          setting.email.toLowerCase() === authUser.email.toLowerCase()
      )
    const hasEditAccess = userPermission && userPermission.role === 'edit'

    if (!isOwner && !hasEditAccess) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    req.ticket = ticket
    next()
  } catch (error) {
    console.error('❌ Error in userCanEditTicket middleware:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { userCanEditTicket }
