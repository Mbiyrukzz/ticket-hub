const { getActivitiesRoute } = require('./activitiesRoutes.js')
const { makeAdminRoute } = require('./admin.js')
const {
  adminAssignedOtherUserTickets,
} = require('./adminAssignedOtherUserTickets.js')
const {
  adminAssignedToMeTickets,
} = require('./adminAssignedToMeTicketsRoute.js')
const { adminCreateTicketRoute } = require('./adminCreateTicketRoute.js')
const { adminNotificationsRoute } = require('./adminNotificationsRoute.js')
const { adminRecentTicketsRoute } = require('./adminRecentTicketsRoute.js')
const { adminSearchRoute } = require('./adminSearchRoute.js')
const { adminList, adminListRoute } = require('./adminsListRoute.js')
const {
  adminTicketPriorityChartRoute,
} = require('./adminTicketPriorityChartRoute.js')
const {
  adminTicketStatusLineChartRoute,
} = require('./adminTicketPriorityStatusRoute.js')
const { adminUpdateTicketRoute } = require('./adminUpdateTicketRoute.js')
const { adminViewTicketsRoute } = require('./adminViewTicketRoute.js')

const { createCommentRoute } = require('./createCommentRoute.js')
const { createTicketRoute } = require('./createTicketRoute.js')
const { createUserRoute } = require('./createUserRoute.js')
const { deleteActivitiesRoute } = require('./deleteActivitiesRoute.js')
const { deleteCommentRoute } = require('./deleteCommentRoute.js')
const { deleteTicketRoute } = require('./deleteTicketRoute.js')
const { getTypingUsersRoute } = require('./getTypingUsersRoute.js')
const { getUserProfileRoute } = require('./getUserProfileRoute.js')
const { listAllUsersRoute } = require('./listAllUsersRoute.js')
const { listAllUsersTickets } = require('./listAllUsersTickets.js')
const { listCommentsRoute } = require('./listCommentsRoute.js')

const { sharedTicketRoute } = require('./sharedTicketRoute.js')

const { ticketslistRoutes } = require('./ticketslistRoutes.js')
const { unShareTicketRoute } = require('./unshareTicketRoute.js')
const { updateCommentRoute } = require('./updateCommentRoute.js')
const { updateTicketRoute } = require('./updateTicketRoute.js')
const { updateUserProfileRoute } = require('./updateUserProfile.js')

const routes = [
  createUserRoute,
  makeAdminRoute,
  adminListRoute,
  adminCreateTicketRoute,
  adminUpdateTicketRoute,
  adminViewTicketsRoute,
  adminRecentTicketsRoute,
  adminAssignedToMeTickets,
  adminAssignedOtherUserTickets,
  adminTicketPriorityChartRoute,
  adminTicketStatusLineChartRoute,
  adminNotificationsRoute,
  adminSearchRoute,

  getUserProfileRoute,
  listAllUsersTickets,
  listAllUsersRoute,
  updateUserProfileRoute,
  getTypingUsersRoute,

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
