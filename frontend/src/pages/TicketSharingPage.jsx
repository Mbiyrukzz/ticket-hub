import React, { useContext } from 'react'
import TicketContext from '../contexts/TicketContext'
import { useParams, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import TicketNotFoundPage from './TicketNotFoundPage'
import SharedEmails from '../components/SharedEmails'

const TicketSharingPage = () => {
  const { tickets, isLoading, shareTicket, unShareTicket } =
    useContext(TicketContext)
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const ticket = tickets.find((t) => t.id === ticketId)

  if (isLoading) return <Loading />
  if (!ticket) return <TicketNotFoundPage />

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          className="mb-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
          onClick={() => navigate(`/tickets/${ticketId}`)}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Share Ticket "{ticket.title}"
        </h1>

        {(!ticket.sharedWithEmails || ticket.sharedWithEmails.length === 0) && (
          <p className="text-gray-500 mb-4">
            Ticket not shared with anyone. Only you and admins can view.
          </p>
        )}

        <SharedEmails
          onAdd={(email, optionalMessage) =>
            shareTicket(ticketId, email, optionalMessage)
          }
          onDelete={(email) => unShareTicket(ticketId, email)}
          emails={ticket.sharedWithEmails || []}
          optionalMessages={
            ticket.sharedWithEmails
              ?.map((item) => item.optionalMessage)
              .filter(Boolean) || []
          }
        />
      </div>
    </div>
  )
}

export default TicketSharingPage
