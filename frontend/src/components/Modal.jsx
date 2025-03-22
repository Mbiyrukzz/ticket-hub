import React from 'react'

const Modal = ({ isOpen, onRequestClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      onClick={onRequestClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
    >
      <div
        className="bg-gray-900 bg-opacity-90 text-white rounded-lg shadow-2xl p-8 w-full max-w-5xl 
                   transform transition-all duration-300 scale-100 border border-yellow-400 
                   shadow-yellow-500/50 hover:shadow-yellow-400/80"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Modal Top Bar */}
        <div className="flex justify-end">
          <button
            onClick={onRequestClose}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
