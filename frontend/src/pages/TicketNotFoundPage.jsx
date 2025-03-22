import React from 'react'

const TicketNotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-400">
      <h2 className="text-4xl font-bold text-red-500">
        404 - Ticket Not Found
      </h2>
      <p className="mt-2 text-lg">
        The requested ticket does not exist or may have been removed.
      </p>
    </div>
  )
}

export default TicketNotFoundPage
