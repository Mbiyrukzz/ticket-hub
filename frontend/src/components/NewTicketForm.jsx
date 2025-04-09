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
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || isSubmitting) return
    setIsSubmitting(true)

    onSubmit({ title, content, image })

    // Reset with a small delay
    setTimeout(() => {
      setTitle('')
      setContent('')
      setImage(null)
      setImagePreview(null)
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full mx-auto transition-all">
      <h2 className="text-2xl font-semibold text-blue-600 dark:text-yellow-400 mb-6 flex items-center gap-3">
        <FontAwesomeIcon icon={faPaperPlane} className="text-xl" />
        Create a New Ticket
      </h2>

      <div className="space-y-5">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ticket-title"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            id="ticket-title"
            type="text"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Briefly describe your issue..."
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 outline-none shadow-sm transition"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {title.length}/100
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ticket-description"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ticket-description"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Explain the issue with all necessary details..."
            rows={5}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 outline-none shadow-sm transition resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 transition group-hover:bg-gray-200 dark:group-hover:bg-gray-700 shadow-sm">
              <FontAwesomeIcon
                icon={faImage}
                className="text-blue-500 dark:text-yellow-400 text-lg"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Attach Image
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload an image"
            />
          </label>

          {imagePreview && (
            <div className="relative mt-4 rounded-xl overflow-hidden shadow-md">
              <img
                src={imagePreview}
                alt="Ticket preview"
                className="w-full object-cover max-h-52"
              />
              <button
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full"
                aria-label="Remove image"
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-500 text-sm"
                />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className={`w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-3 shadow-md transition 
            ${
              isSubmitting || !title.trim() || !content.trim()
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-yellow-500 text-white hover:bg-blue-500 dark:hover:bg-yellow-400'
            }`}
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="text-base" />
              <span>Submit Ticket</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default NewTicketForm
