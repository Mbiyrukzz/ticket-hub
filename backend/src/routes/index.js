const getActivitiesRoute = require('./activitiesRoutes.js')
const { createCommentRoute } = require('./createCommentRoute.js')
const { createTicketRoute } = require('./createTicketRoute.js')
const { createUserRoute } = require('./createUserRoute.js')
const { deleteActivitiesRoute } = require('./deleteActivitiesRoute.js')
const { deleteCommentRoute } = require('./deleteCommentRoute.js')
const { deleteTicketRoute } = require('./deleteTicketRoute.js')
const { listCommentsRoute } = require('./listCommentsRoute.js')
const { ticketslistRoutes } = require('./ticketslistRoutes.js')
const { updateCommentRoute } = require('./updateCommentRoute.js')
const { updateTicketRoute } = require('./updateTicketRoute.js')

const routes = [
  createUserRoute,

  ticketslistRoutes,
  createTicketRoute,
  updateTicketRoute,
  deleteTicketRoute,

  listCommentsRoute,
  deleteCommentRoute,
  createCommentRoute,
  updateCommentRoute,

  getActivitiesRoute,
  deleteActivitiesRoute,
]

module.exports = { routes }
