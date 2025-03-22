import React from 'react'

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="flex flex-col items-center">
        {/* Animated Loader */}
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>

        {/* Loading Text */}
        <p className="mt-4 text-yellow-300 text-lg font-semibold">Loading...</p>
      </div>
    </div>
  )
}

export default Loading
