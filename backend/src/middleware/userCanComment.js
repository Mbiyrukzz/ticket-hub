const { ticketsCollection } = require('../db.js')

const userCanComment = async (req, res, next) => {
  try {
    const authUser = req.user
    const { ticketId } = req.params

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const tickets = (await ticketsCollection()).collection
    const ticket = await tickets.findOne({ id: ticketId })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    const isOwner = ticket.createdBy === authUser.uid
    const isSharedWithUser = ticket.sharedWith?.some(
      (setting) => setting.email.toLowerCase() === authUser.email.toLowerCase()
    )

    if (!isOwner && !isSharedWithUser) {
      return res
        .status(403)
        .json({ error: 'Forbidden: No permission to comment' })
    }

    req.ticket = ticket // Pass ticket to next middleware/handler
    next()
  } catch (error) {
    console.error('❌ Error in userCanComment middleware:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { userCanComment }
