import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketList from '../components/TicketList'
import SharedTicketList from '../components/SharedTicketList'
import TicketContext from '../contexts/TicketContext'
import Modal from '../components/Modal'
import NewTicketForm from '../components/NewTicketForm'
import ConfirmDeleteTicket from '../components/ConfirmDeleteTicket'
import Loading from '../components/Loading'
import ActivityContext from '../contexts/ActivityContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { refreshActivities } = useContext(ActivityContext)
  const { isLoading, tickets, sharedTickets, createTicket, deleteTicket } =
    useContext(TicketContext)

  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false)
  const [ticketIdToDelete, setTicketIdToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('my-tickets') // State for active tab

  if (isLoading) return <Loading />

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

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900">
      {/* Add Ticket Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-medium"
        >
          + Add New Issue
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'my-tickets'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('shared-tickets')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'shared-tickets'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Shared With You
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 gap-6">
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {errorMessage}
            </div>
          )}

          {activeTab === 'my-tickets' ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 max-h-[85vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
              <TicketList
                tickets={tickets}
                onRequestDelete={setTicketIdToDelete}
                onClickItem={(id) => navigate(`/tickets/${id}`)}
              />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow p-4 max-h-[85vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Shared With You</h2>
              <SharedTicketList
                sharedTickets={sharedTickets}
                onClickItem={(id) => navigate(`/shared/${id}`)}
              />
              {sharedTickets.length === 0 && (
                <p className="text-gray-500 text-sm mt-4">
                  No tickets shared with you yet.
                </p>
              )}
            </div>
          )}
        </div>
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
