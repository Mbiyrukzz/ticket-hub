import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
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

  useEffect(() => {
    if (ticket) {
      console.log('Ticket Data:', ticket)
      setEditedTitle(ticket.title)
      setEditedContent(ticket.content)
      setPreviewImage(ticket.image || null)
    }
  }, [ticket])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    console.log('Selected file:', file)
    if (file) {
      setEditedImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const saveChanges = async () => {
    console.log('Saving:', {
      title: editedTitle,
      content: editedContent,
      image: editedImage,
    })
    try {
      await updateTicket(ticket.id, {
        title: editedTitle,
        content: editedContent,
        image: editedImage,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  if (isLoading) return <Loading />
  if (!ticket) return <TicketNotFoundPage />

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        {isEditing ? (
          <>
            <input
              type="text"
              placeholder="Enter title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-yellow-400 focus:outline-none"
            />
            <textarea
              placeholder="Edit your ticket"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 mt-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-yellow-400 focus:outline-none"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 p-2 w-full text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md cursor-pointer"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Ticket Preview"
                className="mt-3 rounded-md shadow-lg max-h-72 w-full object-cover"
                onError={() => console.error('Preview failed:', previewImage)}
              />
            )}
            <div className="flex gap-4 mt-5">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedTitle(ticket.title)
                  setEditedContent(ticket.content)
                  setPreviewImage(ticket.image || null)
                }}
                className="px-5 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-5 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition"
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <h5 className="text-3xl font-bold text-yellow-400">
              {ticket.title}
            </h5>
            <p className="text-gray-300 mt-3 text-lg">{ticket.content}</p>
            <p className="text-md text-gray-400 mt-2">
              <span className="text-yellow-400 font-medium">Posted by:</span>{' '}
              {ticket.postedBy}
            </p>
            {ticket.image && (
              <img
                src={ticket.image}
                alt="Uploaded Ticket"
                className="mt-4 rounded-md shadow-lg max-h-72 w-auto max-w-full mx-auto object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src)
                  e.target.src = '/image.jpg'
                }}
              />
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="mt-5 px-5 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition"
            >
              Edit
            </button>
          </>
        )}
      </div>
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
        <CommentSection ticketId={ticket.id} />
      </div>
    </div>
  )
}

export default TicketDetailPage
