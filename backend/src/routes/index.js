import { createCommentRoute } from './createCommentRoute.js'
import { createTicketRoute } from './createTicketRoute.js'
import { deleteCommentRoute } from './deleteCommentRoute.js'
import { deleteTicketRoute } from './deleteTicketRoute.js'
import { listCommentsRoute } from './listCommentsRoute.js'
import { ticketslistRoutes } from './ticketslistRoutes.js' // Use correct filename
import { updateCommentRoute } from './updateCommentRoute.js'
import { updateTicketRoute } from './updateTicketRoute.js'

export const routes = [
  ticketslistRoutes,
  createTicketRoute,
  updateTicketRoute,
  deleteTicketRoute,

  listCommentsRoute,
  deleteCommentRoute,
  createCommentRoute,
  updateCommentRoute,
]
