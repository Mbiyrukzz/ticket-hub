import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faTrash,
  faComment,
  faTicketAlt,
} from '@fortawesome/free-solid-svg-icons'
import ActivityContext from '../contexts/ActivityContext'
import { Link } from 'react-router-dom'

const getActivityIcon = (type) => {
  switch (type) {
    case 'created-ticket':
      return <FontAwesomeIcon icon={faTicketAlt} className="text-blue-500" />
    case 'deleted-ticket':
      return <FontAwesomeIcon icon={faTrash} className="text-red-500" />
    case 'created-comment':
      return <FontAwesomeIcon icon={faComment} className="text-blue-500" />
    case 'deleted-comment':
      return <FontAwesomeIcon icon={faTrash} className="text-red-500" />
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
      return <FontAwesomeIcon icon={faClock} className="text-gray-500" />
  }
}

const Activities = () => {
  const { activities, formatTime } = useContext(ActivityContext)

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Recent activity
      </h3>

      {activities.length > 0 ? (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to={activity.link || '#'}
              className="flex items-start gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-300 leading-snug">
                  {activity.message}
                </p>
                <span className="text-xs text-gray-500">
                  {formatTime(activity.time)}
                </span>
              </div>
            </Link>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm text-center">
          No recent activities yet.
        </p>
      )}
      <button className="mt-4 text-sm text-blue-600 hover:underline block mx-auto">
        Show more
      </button>
    </div>
  )
}

export default Activities
