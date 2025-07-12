import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCommentDots,
  faHashtag,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'

const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
    case 'Medium':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
    case 'Low':
      return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
    default:
      return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }
}

const truncateText = (text, limit) => {
  if (!text) return ''
  const words = text.split(' ')
  return words.length > limit ? words.slice(0, limit).join(' ') + '...' : text
}

// ✅ Optional section headers
const SectionTitle = ({ label }) => (
  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 mt-6">
    {label}
  </h2>
)

// ✅ Helper to group tickets by post
const groupByPost = (tickets) => {
  return tickets.reduce(
    (acc, ticket) => {
      const key = ticket.post || 'other'
      if (!acc[key]) acc[key] = []
      acc[key].push(ticket)
      return acc
    },
    {
      owner: [],
      shared: [],
      createdFor: [],
      other: [],
    }
  )
}

const TicketList = ({ tickets = [], onRequestDelete }) => {
  const grouped = groupByPost(tickets)

  const renderTickets = (group) =>
    group.map((ticket) => (
      <Link
        to={`/tickets/${ticket.id}`}
        key={ticket.id}
        className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow hover:shadow-md transition-all p-5 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              {ticket.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              {truncateText(ticket.content, 18)}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span
                className={`px-2 py-1 rounded-full font-medium ${getPriorityBadge(
                  ticket.priority
                )}`}
              >
                {ticket.priority}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faHashtag} />
                {ticket.id}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faCommentDots} />
                {ticket.comments?.length || 0}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between h-full text-sm text-gray-500 dark:text-gray-400">
            <span>{ticket.timestamp || 'Just now'}</span>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRequestDelete(ticket.id)
              }}
              className="mt-2 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition text-xs"
            >
              <FontAwesomeIcon icon={faTrash} /> Delete
            </button>
          </div>
        </div>
      </Link>
    ))

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {tickets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
          No tickets available.
        </p>
      ) : (
        <>
          {grouped.owner.length > 0 && (
            <>
              <SectionTitle label="Owned by You" />
              {renderTickets(grouped.owner)}
            </>
          )}
          {grouped.shared.length > 0 && (
            <>
              <SectionTitle label="Shared With You" />
              {renderTickets(grouped.shared)}
            </>
          )}
          {grouped.createdFor.length > 0 && (
            <>
              <SectionTitle label="Created for You by Admin" />
              {renderTickets(grouped.createdFor)}
            </>
          )}
          {grouped.other.length > 0 && (
            <>
              <SectionTitle label="Other Tickets" />
              {renderTickets(grouped.other)}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default TicketList
