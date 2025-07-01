const { getActivitiesRoute } = require('./activitiesRoutes.js')
const { makeAdminRoute } = require('./admin.js')
const { adminCreateTicketRoute } = require('./adminCreateTicketRoute.js')

const { createCommentRoute } = require('./createCommentRoute.js')
const { createTicketRoute } = require('./createTicketRoute.js')
const { createUserRoute } = require('./createUserRoute.js')
const { deleteActivitiesRoute } = require('./deleteActivitiesRoute.js')
const { deleteCommentRoute } = require('./deleteCommentRoute.js')
const { deleteTicketRoute } = require('./deleteTicketRoute.js')
const { getUserProfileRoute } = require('./getUserProfileRoute.js')
const { listCommentsRoute } = require('./listCommentsRoute.js')

const { sharedTicketRoute } = require('./sharedTicketRoute.js')

const { ticketslistRoutes } = require('./ticketslistRoutes.js')
const { unShareTicketRoute } = require('./unshareTicketRoute.js')
const { updateCommentRoute } = require('./updateCommentRoute.js')
const { updateTicketRoute } = require('./updateTicketRoute.js')

const routes = [
  createUserRoute,
  makeAdminRoute,
  adminCreateTicketRoute,

  getUserProfileRoute,
  ticketslistRoutes,
  createTicketRoute,
  updateTicketRoute,
  deleteTicketRoute,

  sharedTicketRoute,
  unShareTicketRoute,

  listCommentsRoute,
  deleteCommentRoute,
  createCommentRoute,
  updateCommentRoute,

  getActivitiesRoute,
  deleteActivitiesRoute,
]

module.exports = { routes }
