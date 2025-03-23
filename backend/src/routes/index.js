import { createTicketRoute } from './createTicketRoute.js'
import { deleteTicketRoute } from './deleteTicketRoute.js'
import { ticketslistRoutes } from './ticketslistRoutes.js' // Use correct filename
import { updateTicketRoute } from './updateTicketRoute.js'

export const routes = [
  ticketslistRoutes,
  createTicketRoute,
  updateTicketRoute,
  deleteTicketRoute,
]
