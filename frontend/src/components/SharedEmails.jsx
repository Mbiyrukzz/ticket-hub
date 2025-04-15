import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SharedEmails = ({ emails, onAdd, onDelete }) => {
  const [newEmail, setNewEmail] = useState('')
  const [optionalMessage, setOptionalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState({})

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

    if (!newEmail || !emailRegex.test(newEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (emails.some((item) => item.email === newEmail)) {
      setErrorMessage('This email has already been shared with.')
      return
    }

    setLoading(true)
    try {
      await onAdd(newEmail, optionalMessage)
      setNewEmail('')
      setOptionalMessage('')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Failed to share the ticket.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (email) => {
    if (!window.confirm(`Unshare this ticket with ${email}?`)) return

    setDeleteLoading((prev) => ({ ...prev, [email]: true }))
    try {
      await onDelete(email)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to unshare the ticket.')
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [email]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {emails.length > 0 ? (
        emails.map(({ email, optionalMessage }) => (
          <div
            key={email}
            className="flex justify-between items-center p-4 bg-white shadow rounded-xl border border-gray-200"
          >
            <div>
              <h5 className="text-gray-800 font-medium">{email}</h5>
              {optionalMessage && (
                <p className="text-sm text-gray-500">{optionalMessage}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(email)
              }}
              aria-label={`Unshare ticket with ${email}`}
              disabled={deleteLoading[email]}
              className={`px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-medium ${
                deleteLoading[email] ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FontAwesomeIcon icon={faTrash} />
              {deleteLoading[email] ? 'Unsharing...' : 'Unshare'}
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No one has been shared this ticket yet.</p>
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
              <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
            )}
            <input
              id="email"
              value={newEmail}
              onChange={handleEmailChange}
              type="email"
              placeholder="recipient@example.com"
              required
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
