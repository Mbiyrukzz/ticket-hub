import React, { useContext, useState, useEffect } from 'react'
import TicketContext from '../contexts/TicketContext'
import { useParams, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import TicketNotFoundPage from './TicketNotFoundPage'
import SharedEmails from '../components/SharedEmails'
import { useUser } from '../hooks/useUser' // Import useUser hook

const TicketSharingPage = () => {
  const {
    tickets,
    setTickets,
    isLoading,
    fetchTicketById,
    shareTicket,
    unShareTicket,
    error: contextError,
  } = useContext(TicketContext)
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser() // Access user from useUser hook
  const [localError, setLocalError] = useState(null)
  const [shareLoading, setShareLoading] = useState(false) // Separate loading for sharing
  const [unshareLoading, setUnshareLoading] = useState(false) // Separate loading for unsharing
  const [fetchingTicket, setFetchingTicket] = useState(false)

  // Find the ticket directly from the tickets array
  const ticket = tickets.find((t) => t.id === ticketId)

  useEffect(() => {
    let isMounted = true // Prevent race conditions

    const loadTicket = async () => {
      if (!ticket && !isLoading && isMounted) {
        setFetchingTicket(true)
        try {
          await fetchTicketById(ticketId)
        } catch (error) {
          if (isMounted) {
            setLocalError('Failed to fetch ticket. Please try again.')
          }
        } finally {
          if (isMounted) {
            setFetchingTicket(false)
          }
        }
      }
    }

    loadTicket()

    return () => {
      isMounted = false // Cleanup on unmount
    }
  }, [ticket, ticketId, isLoading, fetchTicketById])

  if (isLoading || fetchingTicket) return <Loading />
  if (!ticket) {
    return (
      <>
        {contextError && <p className="text-red-500 mb-4">{contextError}</p>}
        <TicketNotFoundPage />
      </>
    )
  }

  if (!user) {
    return <Loading /> // Wait for user to be available
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          className="mb-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
          onClick={() => navigate(`/users/${user.uid}/tickets/${ticketId}`)}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Share Ticket "{ticket.title}"
        </h1>

        {(contextError || localError) && (
          <div className="mb-4">
            {contextError && (
              <p className="text-red-500">{contextError} (Context Error)</p>
            )}
            {localError && (
              <p className="text-red-500">{localError} (Local Error)</p>
            )}
          </div>
        )}

        {(!ticket.sharedWith || ticket.sharedWith.length === 0) && (
          <p className="text-gray-500 mb-4">
            Ticket not shared with anyone. Only you and admins can view.
          </p>
        )}

        <SharedEmails
          onAdd={(email, optionalMessage) =>
            shareTicket(
              ticketId,
              email,
              optionalMessage,
              setTickets,
              setLocalError,
              setShareLoading // Use shareLoading
            )
          }
          onDelete={
            (email) =>
              unShareTicket(ticketId, email, setLocalError, setUnshareLoading) // Use unshareLoading
          }
          emails={ticket.sharedWith || []}
          shareLoading={shareLoading} // Pass shareLoading to SharedEmails
          unshareLoading={unshareLoading} // Pass unshareLoading to SharedEmails
        />
      </div>
    </div>
  )
}

export default TicketSharingPage
