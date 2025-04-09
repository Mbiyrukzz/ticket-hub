import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketList from '../components/TicketList'
import TicketContext from '../contexts/TicketContext'
import Modal from '../components/Modal'
import NewTicketForm from '../components/NewTicketForm'
import ConfirmDeleteTicket from '../components/ConfirmDeleteTicket'
import Loading from '../components/Loading'
import ActivityContext from '../contexts/ActivityContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { refreshActivities } = useContext(ActivityContext)
  const { isLoading, tickets, createTicket, deleteTicket } =
    useContext(TicketContext)

  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false)
  const [ticketIdToDelete, setTicketIdToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

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
      {/* Top Right Add Ticket Button */}
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
        {/* Error Message (if any) */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {errorMessage}
          </div>
        )}

        {/* Ticket List */}
        <TicketList
          tickets={tickets}
          onRequestDelete={setTicketIdToDelete}
          onClickItem={(id) => navigate(`/tickets/${id}`)}
        />
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
