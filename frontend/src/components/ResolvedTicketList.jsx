import React, { useEffect, useContext } from 'react'
import TicketContext from '../contexts/TicketContext'

const ResolvedTicketList = () => {
  const { resolvedTickets, loadResolvedTickets, isResolvedLoading, hasMore } =
    useContext(TicketContext)

  // Fetch resolved tickets on mount
  useEffect(() => {
    loadResolvedTickets(0, 10, true) // Reset on mount
  }, [loadResolvedTickets])

  // Load more tickets
  const handleLoadMore = () => {
    if (!hasMore || isResolvedLoading) return
    loadResolvedTickets(resolvedTickets.length, 10, false) // Append more tickets
  }

  return (
    <div>
      {resolvedTickets.length === 0 && !isResolvedLoading ? (
        <p className="text-gray-600 dark:text-gray-400">
          No resolved tickets found.
        </p>
      ) : (
        <ul className="space-y-4">
          {resolvedTickets.map((ticket) => (
            <li
              key={ticket.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow"
            >
              <h2 className="text-lg font-semibold">{ticket.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ticket.content}
              </p>
              <p className="text-xs mt-2 text-gray-400">
                Updated: {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isResolvedLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {isResolvedLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ResolvedTicketList
