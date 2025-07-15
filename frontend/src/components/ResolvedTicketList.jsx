import React, { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import TicketContext from '../contexts/TicketContext'

const ResolvedTicketList = () => {
  const { resolvedTickets, loadResolvedTickets, isResolvedLoading, hasMore } =
    useContext(TicketContext)

  useEffect(() => {
    loadResolvedTickets(0, 10, true) // Reset on mount
  }, [loadResolvedTickets])

  const handleLoadMore = () => {
    if (!hasMore || isResolvedLoading) return
    loadResolvedTickets(resolvedTickets.length, 10, false) // Append more tickets
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-[#0e0e0e] dark:to-[#1a1a1a] px-4 py-10 md:px-10 text-gray-800 dark:text-gray-100 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">✅ Resolved Tickets</h1>

        {/* Ticket list */}
        {isResolvedLoading && resolvedTickets.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        ) : resolvedTickets.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No resolved tickets found.
          </p>
        ) : (
          <ul className="space-y-6">
            {resolvedTickets.map((ticket) => (
              <li
                key={ticket.id}
                className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h2 className="text-xl font-semibold">{ticket.title}</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {new Date(ticket.updatedAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                  {ticket.content}
                </p>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Ticket →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isResolvedLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full font-semibold shadow transition"
            >
              {isResolvedLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResolvedTicketList
