import React, { useContext, useState, useEffect, useRef } from 'react'
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
  const {
    isLoading,
    tickets,
    sharedTickets,
    createTicket,
    deleteTicket,
    loadMoreTickets,
    hasMore,
  } = useContext(TicketContext)

  const { socket } = useContext(SocketContext)

  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false)
  const [ticketIdToDelete, setTicketIdToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('my-tickets')
  const [highlightedTicketId, setHighlightedTicketId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const listRef = useRef(null)

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

  // ✅ Infinite scroll for My Tickets
  useEffect(() => {
    if (activeTab !== 'my-tickets') return

    const onScroll = () => {
      if (!listRef.current || !hasMore) return
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 200
      if (nearBottom) {
        loadMoreTickets()
      }
    }

    const container = listRef.current
    if (container) container.addEventListener('scroll', onScroll)
    return () => {
      if (container) container.removeEventListener('scroll', onScroll)
    }
  }, [activeTab, hasMore, loadMoreTickets])

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

  // 🔍 Filtered tickets based on search
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSharedTickets = sharedTickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        {/* 🔍 Search Input */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="w-full md:max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Tabs */}
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

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Tickets List */}
        {activeTab === 'my-tickets' ? (
          <div
            ref={listRef}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-4 max-h-[85vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
            <TicketList
              tickets={filteredTickets}
              highlightedTicketId={highlightedTicketId}
              onRequestDelete={setTicketIdToDelete}
              onClickItem={(id) => navigate(`/tickets/${id}`)}
            />
            {!hasMore && tickets.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center mt-4 text-sm">
                You've reached the end.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Shared With You</h2>
            <SharedTicketList
              sharedTickets={filteredSharedTickets}
              onClickItem={(id) => navigate(`/shared/${id}`)}
            />
            {filteredSharedTickets.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
                No tickets match your search.
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
