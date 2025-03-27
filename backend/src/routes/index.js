const { createCommentRoute } = require('./createCommentRoute.js')
const { createTicketRoute } = require('./createTicketRoute.js')
const { deleteCommentRoute } = require('./deleteCommentRoute.js')
const { deleteTicketRoute } = require('./deleteTicketRoute.js')
const { listCommentsRoute } = require('./listCommentsRoute.js')
const { ticketslistRoutes } = require('./ticketslistRoutes.js') // Use correct filename
const { updateCommentRoute } = require('./updateCommentRoute.js')
const { updateTicketRoute } = require('./updateTicketRoute.js')

const routes = [
  ticketslistRoutes,
  createTicketRoute,
  updateTicketRoute,
  deleteTicketRoute,

  listCommentsRoute,
  deleteCommentRoute,
  createCommentRoute,
  updateCommentRoute,
]

module.exports = { routes }
