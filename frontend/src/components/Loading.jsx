import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

const Loading = () => {
  const [dots, setDots] = useState('.')
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'))
    }, 500)

    const scaleInterval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.1 : 1))
    }, 700)

    return () => {
      clearInterval(dotInterval)
      clearInterval(scaleInterval)
    }
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900 transition-all duration-300">
      <div className="relative flex flex-col items-center">
        {/* Rotating Gradient Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 animate-spin"></div>

          {/* Spinning Icon */}
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="text-gray-600 dark:text-gray-300 text-4xl fa-spin"
          />
        </div>

        {/* Animated Text */}
        <p
          className="mt-4 text-xl font-semibold transition-all"
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.3s ease-in-out, color 0.5s',
            color: scale === 1 ? '#4B5563' : '#3B82F6', // gray-600 -> blue-500
          }}
        >
          Loading{dots}
        </p>
      </div>
    </div>
  )
}

export default Loading
