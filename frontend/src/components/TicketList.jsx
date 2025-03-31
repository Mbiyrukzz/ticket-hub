import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import TicketStatusChart from './TickeStatusChart'
import TotalTickets from './TotalTickets'

const truncateText = (text, limit) => {
  if (!text) return '' // Handle null or undefined cases
  const words = text.split(' ')
  return words.length > limit ? words.slice(0, limit).join(' ') + '...' : text
}

const TicketList = ({ tickets, onRequestDelete }) => {
  const ticketStatusData = {
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    closed: tickets.filter((ticket) => ticket.status === 'closed').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'inProgress')
      .length,
  }

  const totalTickets = tickets.length
  return (
    <div className="mt-8 max-w-6xl mx-auto">
      <h4 className="text-3xl font-bold text-blue-600 dark:text-yellow-400 mb-8 border-b-4 border-blue-600 dark:border-yellow-500 pb-3">
        My Tickets
      </h4>

      <div className="flex flex-col md:flex-row -mx-4">
        <TicketStatusChart ticketData={ticketStatusData} />
        <TotalTickets total={totalTickets} />
      </div>

      {tickets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
          No tickets available.
        </p>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Link
              to={`/tickets/${ticket.id}`}
              key={ticket.id}
              className="block group"
            >
              <div className="relative border-l-4 border-blue-600 dark:border-yellow-500 pl-6 py-5 bg-white dark:bg-gray-800 hover:shadow-2xl transition-all rounded-xl shadow-md cursor-pointer transform group-hover:-translate-y-1 duration-300">
                {/* Timeline Dot */}
                <div className="absolute -left-2.5 top-6 w-5 h-5 bg-blue-600 dark:bg-yellow-500 rounded-full shadow-md border-2 border-white dark:border-gray-800"></div>

                {/* Ticket Info */}
                <h5 className="text-2xl font-semibold text-blue-700 dark:text-yellow-300 group-hover:text-blue-800 dark:group-hover:text-yellow-400">
                  {ticket.title}
                </h5>

                <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100">
                  {truncateText(ticket.content, 20)}
                </p>

                {/* Show Image Preview if Available */}
                {ticket.image && (
                  <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={ticket.image}
                      alt="Ticket Preview"
                      className="object-cover w-full h-36 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={(event) => {
                      event.stopPropagation() // Prevent navigation when clicking delete
                      event.preventDefault() // Prevent `Link` from triggering
                      onRequestDelete(ticket.id)
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all flex items-center gap-2 text-lg font-medium transform hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TicketList
