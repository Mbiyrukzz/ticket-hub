import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SharedEmails = ({ optionalMessages, emails, onAdd, onDelete }) => {
  const [newEmail, setNewEmail] = useState('')
  const [optionalMessage, setOptionalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailChange = (e) => {
    const email = e.target.value
    setNewEmail(email)

    if (email && !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.')
    } else {
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newEmail) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!emailRegex.test(newEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setErrorMessage('')
    setLoading(true)

    try {
      await onAdd(newEmail, optionalMessage)
      setNewEmail('')
      setOptionalMessage('')
    } catch (error) {
      setErrorMessage('Failed to share the ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {emails.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-4 bg-white shadow rounded-xl border border-gray-200"
        >
          <div>
            <h5 className="text-gray-800 font-medium">{item.email}</h5>
            {item.optionalMessage && (
              <p className="text-sm text-gray-500">{item.optionalMessage}</p>
            )}
          </div>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onDelete(item.email)
            }}
            aria-label={`Delete shared email ${item.email}`}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        </div>
      ))}

      {optionalMessages?.length > 0 && (
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
            <label htmlFor="email" className="block text-gray-600 mb-1">
              Email Address
            </label>

            {errorMessage && (
              <p id="email-error" className="text-red-500 text-sm mb-2">
                {errorMessage}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-2">
              Enter the email address of the person you want to share with.
              <br />
              They will receive an email with a link to view the ticket.
            </p>
            <input
              id="email"
              value={newEmail}
              onChange={handleEmailChange}
              onBlur={handleEmailChange}
              type="email"
              placeholder="recipient@example.com"
              required
              aria-describedby={errorMessage ? 'email-error' : undefined}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-600 mb-1">
              Message (optional)
            </label>
            <textarea
              id="message"
              value={optionalMessage}
              onChange={(e) => setOptionalMessage(e.target.value)}
              placeholder="Add a note..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sharing...' : 'Share Ticket'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SharedEmails
