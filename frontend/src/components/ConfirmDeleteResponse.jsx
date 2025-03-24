import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'

const ConfirmDeleteResponse = ({ onConfirm, onDeny }) => {
  return (
    <div className="p-6 bg-white text-gray-800 rounded-lg shadow-xl w-2/3 max-w-lg border border-gray-400">
      <h5 className="text-2xl font-bold text-red-600 flex items-center gap-2">
        <FontAwesomeIcon icon={faTrashAlt} /> Delete Comment
      </h5>
      <p className="text-gray-700 mt-3 text-lg leading-relaxed text-center">
        Are you sure you want to delete this comment? This action
        <span className="font-semibold text-red-500"> cannot be undone.</span>
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={onDeny}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faTimes} /> Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-all duration-200 shadow-md flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faCheck} /> Yes, Delete
        </button>
      </div>
    </div>
  )
}

export default ConfirmDeleteResponse
