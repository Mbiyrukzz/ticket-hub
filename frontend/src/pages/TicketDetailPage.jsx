import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPen,
  faCheck,
  faTimes,
  faShare,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import TicketNotFoundPage from './TicketNotFoundPage'
import TicketContext from '../contexts/TicketContext'
import CommentSection from '../components/CommentSection'
import Loading from '../components/Loading'
import CommentProvider from '../providers/CommentProvider'
import SocketContext from '../contexts/SocketContext'

const TicketDetailPage = ({ isOwner = true }) => {
  const { tickets, sharedTickets, updateTicket, isLoading, setTickets } =
    useContext(TicketContext)
  const { socket, isConnected } = useContext(SocketContext)

  const { ticketId } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedImage, setEditedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const ticket = [...tickets, ...sharedTickets].find((t) => t.id === ticketId)

  useEffect(() => {
    if (ticket) {
      setEditedTitle(ticket.title)
      setEditedContent(ticket.content)
      setPreviewImage(ticket.image || null)
    }
  }, [ticket])

  useEffect(() => {
    if (!socket || !ticketId || !isConnected) return
    socket.emit('join-ticket-room', ticketId)

    const handleUpdate = (updatedTicket) => {
      if (updatedTicket.id === ticketId) {
        setEditedTitle(updatedTicket.title)
        setEditedContent(updatedTicket.content)
        setPreviewImage(updatedTicket.image || null)
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      )
    }

    socket.on('ticket-updated', handleUpdate)

    return () => {
      socket.emit('leave-ticket-room', ticketId)
      socket.off('ticket-updated', handleUpdate)
    }
  }, [socket, isConnected, ticketId, setTickets])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditedImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const saveChanges = async () => {
    if (!ticket) return
    try {
      await updateTicket(ticket.createdBy, ticket.id, {
        title: editedTitle,
        content: editedContent,
        image: editedImage || undefined,
      })
      setIsEditing(false)
      setEditedImage(null)
    } catch (error) {
      console.error('❌ Update failed:', error)
    }
  }

  if (isLoading) return <Loading />
  if (!ticket) return <TicketNotFoundPage />

  const { role } = ticket
  const canEdit = role === 'edit'

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Enter ticket title"
              className="w-full p-4 text-2xl font-semibold bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 hover:shadow-md"
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Describe your issue or request..."
              className="w-full p-4 text-base bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none resize-none mt-4 transition-all duration-200 hover:shadow-md"
              rows="5"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Attach Image
            </label>
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-h-72 w-full object-cover hover:shadow-md transition-all duration-200"
              />
            )}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 text-coral-500 dark:text-coral-400 border border-coral-400 dark:border-coral-400 hover:bg-coral-100 dark:hover:bg-coral-900/20 rounded-full font-medium transition-all duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" /> Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400">
                {ticket.title}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {ticket.content}
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Created by:
                  </span>{' '}
                  {ticket.userName}
                </p>
                <p>
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Assigned to:
                  </span>{' '}
                  {ticket.assignedToName || ticket.assignedTo || '—'}
                </p>
                <p>
                  <span className="font-semibold text-gray-500 dark:text-gray-300">
                    Priority:
                  </span>{' '}
                  <span
                    className={clsx(
                      'inline-block px-2 py-0.5 rounded text-white text-xs',
                      ticket.priority === 'High' && 'bg-coral-500',
                      ticket.priority === 'Medium' && 'bg-amber-500',
                      ticket.priority === 'Low' && 'bg-teal-500'
                    )}
                  >
                    {ticket.priority}
                  </span>
                </p>
              </div>

              {ticket.image && (
                <img
                  src={ticket.image}
                  alt="Attached"
                  className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-h-72 w-full object-cover hover:shadow-md transition-all duration-200"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-6">
              {(isOwner || canEdit) && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => navigate(`/sharing/${ticketId}`)}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faShare} className="mr-2" /> Share
                </button>
              )}
            </div>
          </>
        )}

        <div className="pt-10 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCommentDots} /> Responses
          </h3>
          <CommentProvider ticketId={ticketId}>
            <CommentSection
              comments={ticket?.comments}
              ticketId={ticketId}
              userId={ticket?.createdBy}
            />
          </CommentProvider>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
