import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faImage,
  faPaperPlane,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'

const NewTicketForm = ({ onSubmit = () => {} }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null) // Store uploaded image as Base64
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Convert image to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file) // Convert file to Base64
      reader.onloadend = () => {
        setImage(reader.result) // Store Base64 string
      }
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || isSubmitting) return

    setIsSubmitting(true)

    const newTicket = { id: Date.now(), title, content, image }
    const savedTickets = JSON.parse(localStorage.getItem('tickets')) || []
    const updatedTickets = [...savedTickets, newTicket]

    localStorage.setItem('tickets', JSON.stringify(updatedTickets)) // Store tickets

    onSubmit(newTicket)

    // Reset form
    setTitle('')
    setContent('')
    setImage(null)
    setIsSubmitting(false)
  }

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-xl">
      <h5 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
        <FontAwesomeIcon icon={faPaperPlane} className="mr-2 text-lg" />
        Add New Issue
      </h5>

      <div className="space-y-3">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Enter Issue Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />

        {/* Content Input */}
        <textarea
          placeholder="Describe the issue..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          rows="4"
        ></textarea>

        {/* Image Upload Input */}
        <label className="cursor-pointer flex items-center gap-2 bg-gray-800 p-3 rounded-md border border-gray-700 hover:bg-gray-700 transition">
          <FontAwesomeIcon icon={faImage} className="text-yellow-400" />
          <span className="text-gray-300">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* Image Preview */}
        {image && (
          <div className="relative mt-3">
            <img
              src={image}
              alt="Preview"
              className="rounded-md shadow-lg max-h-40 w-full object-cover"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-1 rounded-full"
            >
              <FontAwesomeIcon icon={faTrash} className="text-red-400" />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className={`w-full py-3 font-bold rounded-md transition flex items-center justify-center gap-2
            ${
              isSubmitting || !title.trim() || !content.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
            }`}
        >
          {isSubmitting ? (
            <span>Creating...</span>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>Create</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default NewTicketForm
