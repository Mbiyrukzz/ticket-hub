import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const TicketNotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-800">
      <div className="bg-gray-100 p-8 rounded-lg shadow-md text-center border border-gray-300">
        <h2 className="text-4xl font-bold text-red-500">
          404 - Ticket Not Found
        </h2>
        <p className="mt-2 text-lg text-gray-700">
          The requested ticket does not exist or may have been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Go Back Home
        </Link>
      </div>
    </div>
  )
}

export default TicketNotFoundPage
