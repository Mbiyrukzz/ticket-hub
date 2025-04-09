import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const SharedEmails = ({ optionalMessages, emails, onAdd, onDelete }) => {
  const [newEmail, setNewEmail] = useState('')
  const [optionalMessage, setOptionalMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newEmail) return

    onAdd({ newEmail, optionalMessage })

    // Reset form
    setNewEmail('')
    setOptionalMessage('')
  }

  return (
    <>
      <div className="space-y-6">
        {emails.map((email, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-white shadow rounded-xl border border-gray-200"
          >
            <div>
              <h5 className="text-gray-800 font-medium">{email}</h5>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onDelete(email)
              }}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        ))}
        {optionalMessages.length > 0 && (
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h3 className="text-md font-semibold text-blue-700">
              Previous Notes
            </h3>
            {optionalMessages.map((message, index) => (
              <div
                key={index}
                className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 text-sm"
              >
                <p className="whitespace-pre-line">{message}</p>
                {/* Optional: add a timestamp or author */}
                {/* <span className="text-xs text-gray-400 mt-1 block">Sent on April 9, 2025</span> */}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Share Ticket
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-600 mb-1">Email Address</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                placeholder="recipient@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">
                Message (optional)
              </label>
              <textarea
                value={optionalMessage}
                onChange={(e) => setOptionalMessage(e.target.value)}
                placeholder="Add a note..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Share Ticket
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default SharedEmails
