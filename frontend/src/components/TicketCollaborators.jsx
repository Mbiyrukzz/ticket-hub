import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'

const TicketCollaborators = ({ ticketId, userId }) => {
  const { user } = useUser()
  const [collaborators, setCollaborators] = useState([])
  const [newCollaborator, setNewCollaborator] = useState('')

  const handleAddCollaborator = async () => {
    try {
      const response = await fetch(
        `/users/${userId}/tickets/${ticketId}/collaborators`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            collaborators: [...collaborators, newCollaborator],
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to update collaborators')
      const data = await response.json()
      setCollaborators(data.collaborators)
      setNewCollaborator('')
    } catch (error) {
      console.error('Error updating collaborators:', error)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h4 className="text-lg font-semibold">Manage Collaborators</h4>
      <input
        type="text"
        value={newCollaborator}
        onChange={(e) => setNewCollaborator(e.target.value)}
        placeholder="Enter user ID"
        className="w-full p-2 mt-2 border rounded"
      />
      <button
        onClick={handleAddCollaborator}
        className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
      >
        Add Collaborator
      </button>
      <ul className="mt-4">
        {collaborators.map((collab) => (
          <li key={collab} className="text-gray-700">
            {collab}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TicketCollaborators
