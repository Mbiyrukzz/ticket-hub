import React from 'react'

const TotalTickets = ({ total }) => {
  return (
    <div className="w-full md:w-1/2 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md h-56 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800">
        <h5 className="text-lg font-semibold text-blue-600 dark:text-yellow-400 mb-2">
          Total Tickets Lodged
        </h5>
        <div className="text-5xl font-bold text-blue-700 dark:text-yellow-300">
          {total}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Tickets in the system
        </p>
      </div>
    </div>
  )
}

export default TotalTickets
