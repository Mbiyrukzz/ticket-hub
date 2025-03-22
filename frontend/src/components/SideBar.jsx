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
    <div className="w-64 min-h-screen bg-gray-900 text-gray-300 shadow-lg flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-4">
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faHome} />
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/tickets"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faTicketAlt} />
              Tickets
            </Link>
          </li>
          <li>
            <Link
              to="/analytics"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faChartBar} />
              Analytics
            </Link>
          </li>
          <li>
            <Link
              to="/solved"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-400"
              />
              Solved
            </Link>
          </li>
          <li>
            <Link
              to="/unsolved"
              className="flex items-center gap-3 text-lg px-4 py-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-yellow-400"
              />
              Unsolved
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-3 w-full text-lg px-4 py-2 text-red-400 hover:bg-red-800 hover:text-white rounded-lg transition">
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default SideBar
