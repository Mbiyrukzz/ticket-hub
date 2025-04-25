import { useNavigate, useParams } from 'react-router-dom'

import TicketNotFoundPage from './TicketNotFoundPage'
import Loading from '../components/Loading'
import { useContext } from 'react'
import TicketContext from '../contexts/TicketContext'
import SharedEmails from '../components/SharedEmails'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const TicketSharingPage = () => {
  const { tickets, isLoading, shareTicket, unshareTicket } =
    useContext(TicketContext)
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const ticket = tickets.find((t) => t.id === ticketId)

  if (isLoading) return <Loading />
  if (!ticket) return <TicketNotFoundPage />

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <button
        onClick={() => navigate(`/tickets/${ticketId}`)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span className="text-sm font-medium cursor-pointer">Go back</span>
      </button>

      <h6 className="text-xl font-semibold text-gray-800">
        Share &quot;{ticket.title}&quot;
      </h6>
      {(!ticket.sharedWith || ticket.sharedWith.length === 0) && (
        <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
          Ticket not shared with anyone
        </p>
      )}

      <SharedEmails
        sharingSettings={ticket.sharedWith || []}
        onAdd={({ email, role }) => shareTicket(ticketId, email, role)}
        onDelete={(email) => unshareTicket(ticketId, email)}
      />
    </div>
  )
}

export default TicketSharingPage
