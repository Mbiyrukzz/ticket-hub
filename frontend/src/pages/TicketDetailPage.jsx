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

      console.log('🔍 Ticket Data:', ticket)
      console.log('✅ Comments:', ticket?.comments)

      // Ensure ticket.comments is an array before checking length
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
        image: editedImage || undefined, // Ensure it's either a File or undefined
      }

      await updateTicket(ticket.createdBy, ticket.id, updatedTicketData) // Pass userId and ticketId
      setIsEditing(false)
      setEditedImage(null)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  if (isLoading) return <Loading />
  if (!ticket) return <TicketNotFoundPage />

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Ticket Info Card */}
      <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg border border-gray-300">
        {isEditing ? (
          <>
            <input
              type="text"
              placeholder="Enter title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-3 bg-gray-100 text-gray-800 rounded-md border border-gray-400 focus:border-yellow-500 focus:outline-none"
            />
            <textarea
              placeholder="Edit your ticket"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 mt-3 bg-gray-100 text-gray-800 rounded-md border border-gray-400 focus:border-yellow-500 focus:outline-none"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 p-2 w-full text-sm text-gray-600 bg-gray-100 border border-gray-400 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Ticket Preview"
                className="mt-3 rounded-md shadow-lg max-h-72 w-full object-cover"
              />
            )}
            <div className="flex justify-end gap-4 mt-5">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedTitle(ticket.title)
                  setEditedContent(ticket.content)
                  setPreviewImage(ticket.image || null)
                  setEditedImage(null)
                }}
                className="flex items-center gap-2 px-5 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 transition"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center gap-2 px-5 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition"
              >
                <FontAwesomeIcon icon={faCheck} /> Save
              </button>
            </div>
          </>
        ) : (
          <>
            <h5 className="text-3xl font-bold text-yellow-600">
              {ticket.title}
            </h5>
            <p className="text-gray-700 mt-3 text-lg">{ticket.content}</p>
            <p className="text-md text-gray-500 mt-2">
              <span className="text-yellow-600 font-medium">Posted by:</span>{' '}
              {ticket.postedBy}
            </p>
            {ticket.image && (
              <img
                src={ticket.image}
                alt="Uploaded Ticket"
                className="mt-4 rounded-md shadow-lg max-h-72 w-auto max-w-full mx-auto object-contain"
              />
            )}
            <div className="flex justify-between items-center mt-5">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition"
              >
                <FontAwesomeIcon icon={faPen} /> Edit
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition shadow-md"
              >
                <FontAwesomeIcon icon={faPlusCircle} />{' '}
                {showComments ? 'Hide' : 'Show'} Responses
              </button>
            </div>
          </>
        )}
      </div>

      {/* Comment Section - Expanding with Animation */}
      <div
        className={`transition-all duration-300 ${
          showComments
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        {showComments && (
          <div className="bg-gray-100 text-gray-800 p-6 rounded-lg shadow-lg border border-gray-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-yellow-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faCommentDots} /> Responses
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition text-sm font-bold"
              >
                <FontAwesomeIcon icon={faTimes} /> Close
              </button>
            </div>
            <CommentSection ticketId={ticket?.id} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketDetailPage
