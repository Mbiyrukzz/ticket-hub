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
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || isSubmitting) return

    setIsSubmitting(true)
    onSubmit({ title, content, image: image || null })
    setTitle('')
    setContent('')
    setImage(null)
    setImagePreview(null)
    setIsSubmitting(false)
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700">
      <h5 className="text-3xl font-bold text-blue-600 dark:text-yellow-400 mb-6 flex items-center gap-3">
        <FontAwesomeIcon icon={faPaperPlane} className="text-2xl" />
        Add New Issue
      </h5>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Issue Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 outline-none transition shadow-sm"
        />
        <textarea
          placeholder="Describe the issue..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 outline-none transition shadow-sm"
          rows="5"
        ></textarea>
        <label className="cursor-pointer flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-sm">
          <FontAwesomeIcon
            icon={faImage}
            className="text-blue-500 dark:text-yellow-400 text-xl"
          />
          <span className="text-gray-700 dark:text-gray-300">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        {imagePreview && (
          <div className="relative mt-4 rounded-xl overflow-hidden shadow-md">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full object-cover max-h-48"
            />
            <button
              onClick={() => {
                setImage(null)
                setImagePreview(null)
              }}
              className="absolute top-3 right-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 p-2 rounded-full shadow-md"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="text-red-500 text-lg"
              />
            </button>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className={`w-full py-3 font-bold rounded-xl transition flex items-center justify-center gap-3 shadow-md 
            ${
              isSubmitting || !title.trim() || !content.trim()
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 dark:bg-yellow-500 text-white hover:bg-blue-400 dark:hover:bg-yellow-400'
            }`}
        >
          {isSubmitting ? (
            <span>Creating...</span>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
              <span>Create</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default NewTicketForm
