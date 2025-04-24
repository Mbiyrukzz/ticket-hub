import React, { useContext, useState, useEffect } from 'react'
import TicketContext from '../contexts/TicketContext'
import { useParams, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import TicketNotFoundPage from './TicketNotFoundPage'
import SharedEmails from '../components/SharedEmails'
import { useUser } from '../hooks/useUser'

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
  const { user } = useUser()
  const [shareLoading, setShareLoading] = useState(false)
  const [unshareLoading, setUnshareLoading] = useState(false)
  const [fetchingTicket, setFetchingTicket] = useState(false)

  const ticket = tickets.find((t) => t.id === ticketId)

  // Determine permissions
  const isOwner = ticket?.createdBy === user?.uid
  const role = ticket?.role || 'view'
  const canShare = isOwner || role === 'edit'

  useEffect(() => {
    let isMounted = true

    const loadTicket = async () => {
      if (!ticket && !isLoading && isMounted) {
        setFetchingTicket(true)
        try {
          const fetchedTicket = await fetchTicketById(ticketId)
          if (!fetchedTicket && isMounted) {
            setTickets((prev) => prev.filter((t) => t.id !== ticketId))
          }
        } catch (error) {
          console.error('Fetch ticket error:', error)
          if (isMounted) {
            setTickets((prev) => prev.filter((t) => t.id !== ticketId))
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
      isMounted = false
    }
  }, [ticket, ticketId, isLoading, fetchTicketById, setTickets])

  if (isLoading || fetchingTicket) return <Loading />
  if (!ticket) {
    return (
      <>
        {contextError && (
          <p className="text-red-500 mb-4">{contextError} (Context Error)</p>
        )}
        <TicketNotFoundPage />
      </>
    )
  }

  if (!user) {
    return <Loading />
  }

  console.log('TicketSharingPage user:', { userId: user?.uid, ticketId })
  console.log('Ticket:', ticket)
  console.log('Permissions:', { isOwner, role, canShare })

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

        {contextError && (
          <div className="mb-4">
            <p className="text-red-500">{contextError} (Context Error)</p>
          </div>
        )}

        {!canShare && (
          <p className="text-gray-500 mb-4">
            You have {role} access to this ticket. Only owners or editors can
            modify sharing settings.
          </p>
        )}

        {(!ticket.sharedWith || ticket.sharedWith.length === 0) && (
          <p className="text-gray-500 mb-4">
            Ticket not shared with anyone. Only the owner and admins can view.
          </p>
        )}

        <SharedEmails
          onAdd={({ email, optionalMessage, role }) =>
            canShare
              ? shareTicket(
                  ticketId,
                  email,
                  optionalMessage,
                  role,
                  setTickets,
                  setShareLoading,
                  user
                )
              : alert('You do not have permission to share this ticket.')
          }
          onDelete={(email) =>
            canShare
              ? unShareTicket(ticketId, email, setUnshareLoading)
              : alert('You do not have permission to unshare this ticket.')
          }
          emails={ticket.sharedWith || []}
          shareLoading={shareLoading}
          unshareLoading={unshareLoading}
          disabled={!canShare}
        />
      </div>
    </div>
  )
}

export default TicketSharingPage
