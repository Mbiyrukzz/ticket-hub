import React from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faTicketAlt,
  faChartBar,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'
import LogoutButton from './LogoutButton'

const SideBar = () => {
  return (
    <div className="w-72 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 shadow-2xl flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out">
      {/* Navigation */}
      <nav className="flex-1 px-6 py-6">
        <ul className="space-y-4">
          {[
            {
              to: '/',
              icon: faHome,
              label: 'Home',
              color: 'text-blue-500 dark:text-blue-400',
            },
            {
              to: '/tickets',
              icon: faTicketAlt,
              label: 'Tickets',
              color: 'text-blue-500 dark:text-blue-400',
            },
            {
              to: '/analytics',
              icon: faChartBar,
              label: 'Analytics',
              color: 'text-blue-500 dark:text-blue-400',
            },
            {
              to: '/resolved-tickets',
              icon: faCheckCircle,
              label: 'Solved',
              color: 'text-green-500 dark:text-green-400',
            },
            {
              to: '/unsolved',
              icon: faExclamationCircle,
              label: 'Unsolved',
              color: 'text-red-500 dark:text-red-400',
            },
          ].map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 text-lg font-semibold px-6 py-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 ${
                    isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`
                }
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`${item.color} text-xl`}
                />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        <LogoutButton />
      </div>
    </div>
  )
}

export default SideBar
