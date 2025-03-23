import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTriangleExclamation,
  faHome,
} from '@fortawesome/free-solid-svg-icons'

const NotFoundPage = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden">
      {/* Animated Gold Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full opacity-30 blur-[120px] animate-pulse"></div>
      </div>

      {/* 404 Container */}
      <div className="relative z-10 flex flex-col items-center text-center bg-white border border-yellow-500 rounded-2xl p-12 shadow-lg shadow-yellow-500/40 transition-all duration-500 hover:shadow-yellow-400/80">
        {/* Glowing 404 Text */}
        <h1 className="text-[10rem] font-extrabold text-yellow-500 drop-shadow-md animate-pulse">
          404
        </h1>

        {/* Warning Icon & Error Message */}
        <div className="mt-4 flex items-center gap-3 text-gray-700 text-xl font-medium">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-yellow-500 text-3xl animate-bounce"
          />
          <p className="text-gray-800">Oops! You hit a dead end.</p>
        </div>

        {/* Stylish Animated Button */}
        <Link
          to="/"
          className="mt-8 flex items-center gap-3 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-400 border border-yellow-500 rounded-full shadow-lg shadow-yellow-500/50 transition-all duration-300 transform hover:scale-110 hover:shadow-yellow-400/80"
        >
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          Return Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
