import React, { useEffect, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import TicketContext from '../contexts/TicketContext'

const UnresolvedTicketList = () => {
  const { unresolvedTickets, loadUnresolvedTickets, hasMoreUnresolved } =
    useContext(TicketContext)

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    loadUnresolvedTickets(0, 10, true) // Load on mount
  }, [loadUnresolvedTickets])

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreUnresolved) return
    setIsLoadingMore(true)
    await loadUnresolvedTickets(unresolvedTickets.length, 10, false)
    setIsLoadingMore(false)
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-10 bg-gradient-to-b from-gray-100 to-white dark:from-[#0f0f0f] dark:to-[#1a1a1a] text-gray-800 dark:text-gray-100 transition-all">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🚧 Unresolved Tickets</h1>

        {/* Ticket list */}
        {unresolvedTickets.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No unresolved tickets found.
          </p>
        ) : (
          <ul className="space-y-6">
            {unresolvedTickets.map((ticket) => (
              <li
                key={ticket.id}
                className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h2 className="text-xl font-semibold">{ticket.title}</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {new Date(ticket.updatedAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                  {ticket.content}
                </p>

                <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  Status: <span className="capitalize">{ticket.status}</span>
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

        {/* Load More Button */}
        {hasMoreUnresolved && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full font-semibold shadow transition"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnresolvedTicketList
