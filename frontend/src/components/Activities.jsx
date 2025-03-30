import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

const activityData = [
  {
    id: 1,
    type: 'created',
    message: 'Created a new ticket: "Login issue"',
    time: '5 mins ago',
  },
  {
    id: 2,
    type: 'updated',
    message: 'Updated ticket status to "In Progress"',
    time: '1 hour ago',
  },
  {
    id: 3,
    type: 'resolved',
    message: 'Resolved ticket: "Payment failure"',
    time: 'Yesterday',
  },
]

const getActivityIcon = (type) => {
  switch (type) {
    case 'created':
      return <FontAwesomeIcon icon={faClock} className="text-blue-500" />
    case 'updated':
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-yellow-500"
        />
      )
    case 'resolved':
      return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
    default:
      return null
  }
}

const Activities = () => {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Recent Activities
      </h2>

      {activityData.length > 0 ? (
        <ul className="space-y-4">
          {activityData.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="text-lg">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-300">
                  {activity.message}
                </p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No recent activities yet.
        </p>
      )}
    </div>
  )
}

export default Activities
