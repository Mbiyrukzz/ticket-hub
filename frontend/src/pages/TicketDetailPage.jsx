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
import TicketNotFoundPage from './TicketNotFoundPage'
import TicketContext from '../contexts/TicketContext'
import CommentSection from '../components/CommentSection'
import Loading from '../components/Loading'

const TicketDetailPage = ({ isOwner, isAdmin }) => {
  const { tickets, sharedTickets, updateTicket, isLoading } =
    useContext(TicketContext)
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const ticket = [...tickets, ...sharedTickets].find((t) => t.id === ticketId)

  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedImage, setEditedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (ticket) {
      setEditedTitle(ticket.title)
      setEditedContent(ticket.content)
      setPreviewImage(ticket.image || null)
    }
  }, [ticket])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditedImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const saveChanges = async () => {
    try {
      const updatedTicketData = {
        title: editedTitle,
        content: editedContent,
        image: editedImage || undefined,
      }

      await updateTicket(ticket.createdBy, ticket.id, updatedTicketData)
      setIsEditing(false)
      setEditedImage(null)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  if (isLoading) return <Loading />
  if (!ticket) return <TicketNotFoundPage />

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg transition-all duration-300 space-y-6">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-4 text-2xl font-semibold bg-gray-50 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              rows="5"
              placeholder="Describe the issue or request in detail..."
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 rounded-lg border border-gray-200 shadow-sm max-h-72 w-full object-cover"
              />
            )}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-400 transition"
              >
                <FontAwesomeIcon icon={faCheck} /> Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-yellow-600">
                {ticket.title}
              </h2>
              <p className="text-lg text-gray-700">{ticket.content}</p>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-yellow-600">Posted by:</span>{' '}
                {ticket.postedBy}
              </p>
              {ticket.image && (
                <img
                  src={ticket.image}
                  alt="Ticket"
                  className="mt-4 rounded-lg border border-gray-200 shadow-sm max-h-72 w-full object-cover"
                />
              )}
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-4 justify-end pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-400 transition"
                >
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                <button
                  onClick={() => navigate(`/sharing/${ticketId}`)}
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
                >
                  <FontAwesomeIcon icon={faShare} /> Share
                </button>
              </div>
            )}
          </>
        )}

        {/* Comment Section */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCommentDots} /> Responses
          </h3>
          <CommentSection
            comments={ticket?.comments}
            ticketId={ticket?.id}
            userId={ticket?.createdBy}
          />
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
