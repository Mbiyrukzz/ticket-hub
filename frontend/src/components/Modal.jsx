import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const Modal = ({ isOpen, onRequestClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      onClick={onRequestClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
    >
      <div
        className="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl border border-gray-300 
                   transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Modal Header */}
        <div className="flex justify-end">
          <button
            onClick={onRequestClose}
            className="p-2 text-gray-600 hover:text-gray-900 transition"
          >
            <FontAwesomeIcon icon={faTimes} className="text-2xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}

export default Modal
