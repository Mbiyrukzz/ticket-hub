import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketList from '../components/TicketList'
import TicketContext from '../contexts/TicketContext'
import Modal from '../components/Modal'
import NewTicketForm from '../components/NewTicketForm'
import ConfirmDeleteTicket from '../components/ConfirmDeleteTicket'
import Loading from '../components/Loading'

const Dashboard = () => {
  const { isLoading, tickets, createTicket, deleteTicket } =
    useContext(TicketContext)
  const [newTicketModalIsOpen, setNewTicketModalIsOpen] = useState(false)
  const [currentlyDeleteTicketId, setCurrentlyDeleteTicketId] = useState(null)
  const navigate = useNavigate()

  if (isLoading) {
    return <Loading />
  }

  const handleCreateTicket = async ({ title, content, image }) => {
    try {
      await createTicket({ title, content, image })
      setNewTicketModalIsOpen(false) // Close only after successful creation
    } catch (error) {
      console.error('❌ Failed to create ticket:', error)
    }
  }

  const handleDeleteTicket = async (id) => {
    try {
      await deleteTicket(id) // Delete from backend and update state
      setCurrentlyDeleteTicketId(null) // Close modal immediately
    } catch (error) {
      console.error('❌ Failed to delete ticket:', error)
    }
  }

  return (
    <div className="rounded-lg relative flex min-h-screen bg-gray-100 text-gray-900">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Modal for Adding New Ticket */}
        <Modal
          isOpen={newTicketModalIsOpen}
          onRequestClose={() => setNewTicketModalIsOpen(false)}
        >
          <NewTicketForm onSubmit={handleCreateTicket} />
        </Modal>

        {/* Modal for Confirming Ticket Deletion */}
        <Modal
          isOpen={currentlyDeleteTicketId !== null}
          onRequestClose={() => setCurrentlyDeleteTicketId(null)}
        >
          <ConfirmDeleteTicket
            onConfirm={() => handleDeleteTicket(currentlyDeleteTicketId)}
            onDeny={() => setCurrentlyDeleteTicketId(null)}
          />
        </Modal>

        {/* Add New Issue Button - Positioned at Top Right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setNewTicketModalIsOpen(true)}
            className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300 transition-all duration-200"
          >
            + Add New Issue
          </button>
        </div>

        {/* Render Ticket List */}
        <TicketList
          tickets={tickets}
          onRequestDelete={(id) => setCurrentlyDeleteTicketId(id)}
          onClickItem={(id) => navigate(`/tickets/${id}`)}
        />
      </div>
    </div>
  )
}

export default Dashboard
