import path from 'path'
const { verifyAuthToken } = require('../middleware/verifyAuthToken.js')
const { userOwnsTicket } = require('../middleware/userOwnsTicket.js')

export const shareTicketRoute = {
  path: '/tickets/:ticketId/share-ticket',
  method: 'post',
  middleware: [verifyAuthToken, userOwnsTicket],
  handler: async (req, res) => {},
}
