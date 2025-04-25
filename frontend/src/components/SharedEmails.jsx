import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faShareSquare } from '@fortawesome/free-solid-svg-icons'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EDIT = 'edit'
const VIEW = 'view'

const SharedEmails = ({ sharingSettings, onAdd, onDelete }) => {
  const [newEmail, setNewEmail] = useState('')
  const [selectedPermission, setSelectedPermission] = useState(VIEW)

  const [errorMessage, setErrorMessage] = useState('')

  const onClickAdd = () => {
    if (!newEmail) {
      return setErrorMessage('Please enter a value')
    }

    if (!emailRegex.test(newEmail)) {
      return setErrorMessage('Enter a valid email')
    }
    onAdd({ email: newEmail, role: selectedPermission })
    setNewEmail('')
    setErrorMessage('')
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">Shared With</h3>

      <div className="space-y-2">
        {sharingSettings.map(({ email, role }) => (
          <div
            key={email}
            className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-gray-700">{email}</p>
            <p className="text-sm text-gray-500">
              {role || 'No role assigned'}
            </p>

            <button
              onClick={() => onDelete(email)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remove"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {errorMessage && (
          <p className="text-sm text-red-500 bg-red-100 border border-red-200 px-4 py-2 rounded-lg">
            {errorMessage}
          </p>
        )}

        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Enter an email to share with..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Permissions</p>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="radio"
                value={VIEW}
                checked={selectedPermission === VIEW}
                onChange={() => setSelectedPermission(VIEW)}
                className="accent-yellow-500"
              />
              <span>Can view</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="radio"
                value={EDIT}
                checked={selectedPermission === EDIT}
                onChange={() => setSelectedPermission(EDIT)}
                className="accent-yellow-500"
              />
              <span>Can edit</span>
            </label>
          </div>
        </div>

        <button
          onClick={onClickAdd}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-4 py-2 rounded-lg"
        >
          <FontAwesomeIcon icon={faShareSquare} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  )
}

export default SharedEmails
