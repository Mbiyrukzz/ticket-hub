import React from 'react'

const ConfirmDeleteTicket = ({ onConfirm, onDeny }) => {
  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-md">
      <h5 className="text-xl font-bold text-red-500">Delete Ticket</h5>
      <p className="text-gray-300 mt-2">
        Are you sure you want to delete this ticket? This action cannot be
        undone.
      </p>

      {/* Buttons */}
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onDeny}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default ConfirmDeleteTicket
