import React, { useEffect, useContext, useState } from 'react'
import TicketContext from '../contexts/TicketContext'

const UnresolvedTicketList = () => {
  const { unresolvedTickets, loadUnresolvedTickets, hasMoreUnresolved } =
    useContext(TicketContext)

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Load on mount
  useEffect(() => {
    loadUnresolvedTickets(0, 10, true)
  }, [loadUnresolvedTickets])

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreUnresolved) return
    setIsLoadingMore(true)
    await loadUnresolvedTickets(unresolvedTickets.length, 10, false)
    setIsLoadingMore(false)
  }

  return (
    <div>
      {unresolvedTickets.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No unresolved tickets found.
        </p>
      ) : (
        <ul className="space-y-4">
          {unresolvedTickets.map((ticket) => (
            <li
              key={ticket.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow"
            >
              <h2 className="text-lg font-semibold">{ticket.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ticket.content}
              </p>
              <p className="text-xs mt-2 text-gray-400">
                Status: <span className="capitalize">{ticket.status}</span>
              </p>
              <p className="text-xs text-gray-400">
                Updated: {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {hasMoreUnresolved && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default UnresolvedTicketList
