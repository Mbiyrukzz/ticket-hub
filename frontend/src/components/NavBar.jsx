import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import ThemeContext from '../contexts/ThemeContext'

const NavBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <nav className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_5px_10px_rgba(255,215,0,0.15)]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-yellow-400 drop-shadow-md"
        >
          TicketHub
        </Link>

        {/* Search Bar */}
        <div className="relative w-1/3 hidden md:block">
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-100 text-gray-200 dark:text-gray-800 rounded-lg border border-gray-700 dark:border-gray-300 focus:border-yellow-400 focus:outline-none shadow-sm"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-600"
          />
        </div>

        {/* Navigation & User Profile */}
        <div className="flex items-center space-x-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:text-yellow-400 transition"
          >
            <FontAwesomeIcon
              icon={theme === 'dark' ? faSun : faMoon}
              className="text-xl"
            />
          </button>

          {/* User Profile */}
          <div className="relative group">
            <img
              src="https://via.placeholder.com/40" // Replace with actual user image URL
              alt="User"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-yellow-400 shadow-sm hover:shadow-yellow-200 transition"
            />

            {/* Dropdown Menu */}
            <div className="absolute z-50 right-0 mt-2 w-48 bg-gray-800 dark:bg-gray-200 border border-gray-700 dark:border-gray-300 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-300 dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-t-lg"
              >
                Profile
              </Link>
              <Link
                to="/logout"
                className="block px-4 py-2 text-gray-300 dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-b-lg"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
