import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'

const ConfirmDeleteResponse = ({ onConfirm, onDeny }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md">
      <div className="p-6 bg-white bg-opacity-90 text-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-300">
        <h5 className="text-2xl font-bold text-red-600 flex items-center gap-3">
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Comment
        </h5>
        <p className="text-gray-800 mt-4 text-lg text-center">
          Are you sure you want to delete this comment? <br />
          <span className="font-semibold text-red-500">
            This action cannot be undone.
          </span>
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onDeny}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-full shadow-md hover:bg-gray-300 transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCheck} /> Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteResponse
