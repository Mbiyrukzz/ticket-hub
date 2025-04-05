import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faCog,
  faSignOutAlt,
  faBars,
} from '@fortawesome/free-solid-svg-icons'

const UsersProfilePage = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-white w-full lg:w-64 shadow-lg lg:h-screen sticky top-0 p-6 z-10">
        <div className="flex items-center justify-between lg:justify-start mb-8">
          <h1 className="text-2xl font-bold text-blue-600">MyProfile</h1>
          <button className="lg:hidden">
            <FontAwesomeIcon icon={faBars} className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="space-y-4 text-gray-700">
          <div className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
            <FontAwesomeIcon icon={faUser} />
            Overview
          </div>
          <div className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
            <FontAwesomeIcon icon={faCog} />
            Settings
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          User Profile
        </h2>

        <div className="bg-white rounded-2xl shadow p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 space-y-4 md:space-y-0">
            <img
              src="https://via.placeholder.com/120"
              alt="User Avatar"
              className="w-28 h-28 rounded-full object-cover shadow-md"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">John Doe</h3>
              <p className="text-gray-600">john.doe@example.com</p>
              <p className="text-gray-500 mt-1">Member since Jan 2023</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">About</h4>
            <p className="text-gray-700 leading-relaxed">
              I'm a passionate developer with a knack for building clean and
              intuitive user interfaces. I enjoy exploring new technologies,
              solving real-world problems, and collaborating with others in
              tech.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UsersProfilePage
