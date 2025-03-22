import React from 'react'

const ConfirmDeleteResponse = ({ onConfirm, onDeny }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div className="p-6 bg-gray-900 bg-opacity-90 text-white rounded-lg shadow-xl w-1/3 border border-gray-700">
        {/* Header */}
        <h5 className="text-2xl font-bold text-red-500 flex items-center">
          🛑 Delete Comment
        </h5>

        {/* Message */}
        <p className="text-gray-300 mt-2 text-lg leading-relaxed">
          Are you sure you want to delete this comment? This action
          <span className="font-semibold text-red-400"> cannot be undone.</span>
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-6">
          <button
            onClick={onDeny}
            className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all duration-200 shadow-md"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteResponse
