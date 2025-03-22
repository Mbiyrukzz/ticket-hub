import React, { useContext, useState } from 'react'
import TicketList from '../components/TicketList'
import TicketContext from '../contexts/TicketContext'
import Modal from '../components/Modal'
import NewTicketForm from '../components/NewTicketForm'
import ConfirmDeleteTicket from '../components/ConfirmDeleteTicket'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { tickets, createTicket, deleteTicket } = useContext(TicketContext)
  const [newTicketModalIsOpen, setNewTicketModalIsOpen] = useState(false)

  const [currentlyDeleteTicketId, setCurrentlyDeleteTicketId] = useState()

  const handleCreateTicket = ({ title, content }) => {
    createTicket({ title, content })
    setNewTicketModalIsOpen(false)
  }

  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Modal for Adding New Ticket */}
        <Modal
          isOpen={newTicketModalIsOpen}
          onRequestClose={() => setNewTicketModalIsOpen(false)}
        >
          <NewTicketForm onSubmit={handleCreateTicket} />
        </Modal>

        <Modal
          isOpen={!!currentlyDeleteTicketId}
          onRequestClose={() => setCurrentlyDeleteTicketId('')}
        >
          <ConfirmDeleteTicket
            onConfirm={() => {
              deleteTicket(currentlyDeleteTicketId)
              setCurrentlyDeleteTicketId('')
            }}
            onDeny={() => setCurrentlyDeleteTicketId('')}
          />
        </Modal>

        {/* Add New Issue Button - Positioned at Top Right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setNewTicketModalIsOpen(true)}
            className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-400 transition-all duration-200"
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
