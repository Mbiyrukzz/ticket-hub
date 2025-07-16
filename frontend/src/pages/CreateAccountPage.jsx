import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const CreateAccountPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-2xl border dark:border-gray-700 text-center animate-fadeIn">
        <div className="text-blue-600 dark:text-blue-400 mb-6">
          <FontAwesomeIcon icon={faCircleInfo} size="4x" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Account Creation Restricted
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-6">
          You must be using one of our products or services to create an
          account. If you believe you should have access, please contact us.
        </p>

        <a
          href="https://ashmif.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          Contact Us
          <FontAwesomeIcon icon={faArrowRight} />
        </a>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
          © {new Date().getFullYear()} Ashmif Technologies. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default CreateAccountPage
