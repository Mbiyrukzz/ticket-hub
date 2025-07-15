import React, { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TicketContext from '../contexts/TicketContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

const NewsFeedPage = () => {
  const { news, fetchNews } = useContext(TicketContext)

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white dark:from-[#0f0f0f] dark:to-[#1a1a1a] px-4 py-12 md:px-10 text-gray-800 dark:text-gray-100 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">📰 News Feed</h1>
        </div>

        {/* Posts */}
        {news.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
            No news posts available.
          </div>
        ) : (
          <div className="space-y-8">
            {news.map((post) => {
              const image =
                Array.isArray(post.images) && post.images.length > 0
                  ? post.images[0]
                  : post.images
              const imageUrl = image || image ? image : `${API_URL}${image}`

              return (
                <Link
                  key={post.id}
                  to={`/news/${post.id}`}
                  className="block transition-transform hover:scale-[1.01]"
                >
                  <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-shadow">
                    {imageUrl && (
                      <div className="w-full h-48 overflow-hidden group relative">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300 ease-in-out"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {post.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>By {post.authorName || 'Unknown'}</span>
                        <span>
                          {post.date
                            ? new Date(post.date).toLocaleDateString()
                            : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsFeedPage
