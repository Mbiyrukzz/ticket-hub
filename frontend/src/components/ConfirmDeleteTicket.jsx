import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons'

const ConfirmDeleteTicket = ({ onConfirm, onDeny }) => {
  return (
    <div className="p-6 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-300">
      <h5 className="text-xl font-bold text-red-600 flex items-center gap-2">
        <FontAwesomeIcon icon={faTrashAlt} /> Delete Ticket
      </h5>
      <p className="text-gray-600 mt-2">
        Are you sure you want to delete this ticket?
        <span className="font-semibold text-red-500">
          {' '}
          This action cannot be undone.
        </span>
      </p>

      {/* Buttons */}
      <div className="mt-4 flex justify-end gap-4">
        <button
          onClick={onDeny}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faTimes} /> Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition shadow-md flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete
        </button>
      </div>
    </div>
  )
}

export default ConfirmDeleteTicket
