import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faTicketAlt,
  faChartBar,
  faCheckCircle,
  faExclamationCircle,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'

const SideBar = () => {
  return (
    <div className="w-64 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 shadow-lg flex flex-col border-r border-gray-300 dark:border-gray-700">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-3">
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faHome}
                className="text-blue-500 dark:text-blue-400"
              />
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/tickets"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faTicketAlt}
                className="text-blue-500 dark:text-blue-400"
              />
              Tickets
            </Link>
          </li>
          <li>
            <Link
              to="/analytics"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faChartBar}
                className="text-blue-500 dark:text-blue-400"
              />
              Analytics
            </Link>
          </li>
          <li>
            <Link
              to="/solved"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 dark:text-green-400"
              />
              Solved
            </Link>
          </li>
          <li>
            <Link
              to="/unsolved"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-red-500 dark:text-red-400"
              />
              Unsolved
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <button className="flex items-center gap-3 w-full text-lg px-4 py-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 hover:text-red-700 dark:hover:text-white rounded-lg transition">
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default SideBar
