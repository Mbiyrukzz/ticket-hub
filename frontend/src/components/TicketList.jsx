import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const truncateText = (text, limit) => {
  const words = text.split(' ')
  return words.length > limit ? words.slice(0, limit).join(' ') + '...' : text
}

const TicketList = ({ tickets, onRequestDelete }) => {
  return (
    <div className="mt-6 max-w-6xl mx-auto">
      <h4 className="text-3xl font-bold text-yellow-400 mb-6 border-b-2 border-yellow-500 pb-2">
        My Tickets
      </h4>

      {tickets.length === 0 ? (
        <p className="text-gray-400 text-center">No tickets available.</p>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Link
              to={`/tickets/${ticket.id}`}
              key={ticket.id}
              className="block"
            >
              <div className="relative border-l-4 border-yellow-500 pl-6 py-4 bg-gray-800/50 hover:bg-gray-800 transition rounded-lg shadow-md cursor-pointer">
                {/* Timeline Dot */}
                <div className="absolute -left-2.5 top-6 w-4 h-4 bg-yellow-500 rounded-full shadow-md"></div>

                {/* Ticket Info */}
                <h5 className="text-xl font-semibold text-yellow-300">
                  {ticket.title}
                </h5>

                <p className="text-gray-300 mt-1 leading-relaxed">
                  {truncateText(ticket.content, 20)}
                </p>

                {/* Show Image Preview if Available */}
                {ticket.image && (
                  <div className="mt-3">
                    <img
                      src={ticket.image}
                      alt="Ticket Preview"
                      className="rounded-md shadow-lg max-h-32 w-full object-cover"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 flex justify-between items-center">
                  {/* Delete Button */}
                  <button
                    onClick={(event) => {
                      event.stopPropagation() // Prevent navigation when clicking delete
                      event.preventDefault() // Prevent `Link` from triggering
                      onRequestDelete(ticket.id)
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition flex items-center gap-1"
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
