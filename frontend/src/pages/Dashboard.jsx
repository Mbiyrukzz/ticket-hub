import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketList from '../components/TicketList'
import SharedTicketList from '../components/SharedTicketList'
import TicketContext from '../contexts/TicketContext'
import SocketContext from '../contexts/SocketContext'
import Modal from '../components/Modal'
import NewTicketForm from '../components/NewTicketForm'
import ConfirmDeleteTicket from '../components/ConfirmDeleteTicket'
import Loading from '../components/Loading'
import ActivityContext from '../contexts/ActivityContext'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
  const navigate = useNavigate()
  const { refreshActivities } = useContext(ActivityContext)
  const { isLoading, tickets, sharedTickets, createTicket, deleteTicket } =
    useContext(TicketContext)

  const { socket } = useContext(SocketContext)

  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false)
  const [ticketIdToDelete, setTicketIdToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('my-tickets')
  const [highlightedTicketId, setHighlightedTicketId] = useState(null)

  // ✅ Real-time updates via shared socket
  useEffect(() => {
    if (!socket) return

    const handleCreated = (ticket) => {
      toast.success(`New ticket created: ${ticket.title}`)
      setHighlightedTicketId(ticket.id)
    }

    const handleUpdated = (ticket) => {
      toast(`Ticket updated: ${ticket.title}`)
      setHighlightedTicketId(ticket.id)
    }

    const handleDeleted = ({ ticketId, title }) => {
      toast.error(`Ticket deleted: ${title || ticketId}`)
    }

    socket.on('ticket-created', handleCreated)
    socket.on('ticket-updated', handleUpdated)
    socket.on('ticket-deleted', handleDeleted)

    return () => {
      socket.off('ticket-created', handleCreated)
      socket.off('ticket-updated', handleUpdated)
      socket.off('ticket-deleted', handleDeleted)
    }
  }, [socket])

  // Clear highlight after timeout
  useEffect(() => {
    if (highlightedTicketId) {
      const timeout = setTimeout(() => setHighlightedTicketId(null), 3000)
      return () => clearTimeout(timeout)
    }
  }, [highlightedTicketId])

  const handleNewTicketSubmit = async ({ title, content, image }) => {
    try {
      await createTicket({ title, content, image })
      await refreshActivities()
      setNewTicketModalOpen(false)
    } catch (err) {
      console.error('❌ Error creating ticket:', err)
      setErrorMessage('Failed to create ticket. Please try again.')
    }
  }

  const handleTicketDelete = async (id) => {
    try {
      await deleteTicket(id)
      await refreshActivities()
      setTicketIdToDelete(null)
    } catch (err) {
      console.error('❌ Error deleting ticket:', err)
      setErrorMessage('Failed to delete ticket. Please try again.')
    }
  }

  if (isLoading) return <Loading />

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Add Ticket Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition font-medium"
        >
          + Add New Issue
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('my-tickets')}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeTab === 'my-tickets'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('shared-tickets')}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeTab === 'shared-tickets'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Shared With You
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600 rounded-lg">
            {errorMessage}
          </div>
        )}

        {activeTab === 'my-tickets' ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
            <TicketList
              tickets={tickets}
              highlightedTicketId={highlightedTicketId}
              onRequestDelete={setTicketIdToDelete}
              onClickItem={(id) => navigate(`/tickets/${id}`)}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Shared With You</h2>
            <SharedTicketList
              sharedTickets={sharedTickets}
              onClickItem={(id) => navigate(`/shared/${id}`)}
            />
            {sharedTickets.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
                No tickets shared with you yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={newTicketModalOpen}
        onRequestClose={() => setNewTicketModalOpen(false)}
        title="Create New Ticket"
      >
        <NewTicketForm onSubmit={handleNewTicketSubmit} />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={ticketIdToDelete !== null}
        onRequestClose={() => setTicketIdToDelete(null)}
        title="Confirm Ticket Deletion"
      >
        <ConfirmDeleteTicket
          onConfirm={() => handleTicketDelete(ticketIdToDelete)}
          onDeny={() => setTicketIdToDelete(null)}
        />
      </Modal>
    </div>
  )
}

export default Dashboard
