import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TicketContext from '../contexts/TicketContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

const NewsDetailPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { news, fetchNews } = useContext(TicketContext)
  const [zoomedImage, setZoomedImage] = useState(null)

  useEffect(() => {
    if (news.length === 0) fetchNews()
  }, [news, fetchNews])

  if (news.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-gray-500">
        Loading news post...
      </div>
    )
  }

  const post = news.find((n) => `${n.id}` === `${postId}`)
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 dark:text-red-400">
        ❌ News post not found.
      </div>
    )
  }

  const images = Array.isArray(post.images)
    ? post.images
    : post.images
    ? [post.images]
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white dark:from-gray-950 dark:to-gray-900 px-4 py-10 md:px-8 text-gray-800 dark:text-gray-100 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Card container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 md:p-10 transition-all">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 dark:text-blue-400 hover:underline hover:opacity-80 transition"
            >
              ← Back to Feed
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>
              By{' '}
              <span className="font-medium">
                {post.authorName || 'Unknown'}
              </span>
            </span>
            <span className="mx-2">•</span>
            <span>
              {post.date ? new Date(post.date).toLocaleDateString() : 'No date'}
            </span>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {images.map((img, i) => {
                const url = img.startsWith('http') ? img : `${API_URL}${img}`
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl shadow group cursor-zoom-in"
                    onClick={() => setZoomedImage(url)}
                  >
                    <img
                      src={url}
                      alt={`News image ${i + 1}`}
                      className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-300 ease-in-out"
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Content */}
          <div className="prose dark:prose-invert prose-lg max-w-none leading-relaxed">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
        </div>
      </div>

      {/* Click-to-zoom modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl transition-transform transform scale-100 hover:scale-105 duration-300"
          />
        </div>
      )}
    </div>
  )
}

export default NewsDetailPage
