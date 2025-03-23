import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="flex flex-col items-center">
        {/* FontAwesome Spinner */}
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-blue-500 text-4xl animate-spin"
        />

        {/* Loading Text */}
        <p className="mt-4 text-gray-600 text-lg font-semibold">Loading...</p>
      </div>
    </div>
  )
}

export default Loading
