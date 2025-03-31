import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPen,
  faCheck,
  faTimes,
  faPlusCircle,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import TicketNotFoundPage from './TicketNotFoundPage'
import TicketContext from '../contexts/TicketContext'
import CommentSection from '../components/CommentSection'
import Loading from '../components/Loading'

const TicketDetailPage = () => {
  const { tickets, updateTicket, isLoading } = useContext(TicketContext)
  const { ticketId } = useParams()
  const ticket = tickets.find((t) => t.id === ticketId)

  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedImage, setEditedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (ticket) {
      setEditedTitle(ticket.title)
      setEditedContent(ticket.content)
      setPreviewImage(ticket.image || null)

      if (Array.isArray(ticket.comments) && ticket.comments.length > 0) {
        setShowComments(true)
      }
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
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Ticket Info Card */}
      <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-3 text-xl bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 mt-3 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              rows="4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 w-full bg-gray-100 border border-gray-300 rounded-lg p-2 text-sm cursor-pointer"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 rounded-lg shadow-md max-h-72 w-full object-cover"
              />
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-5 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition"
              >
                <FontAwesomeIcon icon={faCheck} /> Save
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-yellow-600">
              {ticket.title}
            </h2>
            <p className="text-gray-700 mt-3 text-lg">{ticket.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-yellow-600 font-semibold">Posted by:</span>{' '}
              {ticket.postedBy}
            </p>
            {ticket.image && (
              <img
                src={ticket.image}
                alt="Ticket"
                className="mt-4 rounded-lg shadow-md max-h-72 w-full object-cover"
              />
            )}
            <div className="flex justify-between items-center mt-5">
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition"
              >
                <FontAwesomeIcon icon={faPen} /> Edit
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition"
              >
                <FontAwesomeIcon icon={faPlusCircle} />{' '}
                {showComments ? 'Hide' : 'Show'} Responses
              </button>
            </div>
          </>
        )}
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="bg-gray-100 text-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-yellow-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faCommentDots} /> Responses
            </h3>
            <button
              onClick={() => setShowComments(false)}
              className="text-red-500 hover:text-red-400 transition text-sm font-bold"
            >
              <FontAwesomeIcon icon={faTimes} /> Close
            </button>
          </div>
          <CommentSection
            comments={ticket?.comments}
            ticketId={ticket?.id}
            userId={ticket?.createdBy}
          />
        </div>
      )}
    </div>
  )
}

export default TicketDetailPage
