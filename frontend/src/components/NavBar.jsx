import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import ThemeContext from '../contexts/ThemeContext'

const NavBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md transition-all duration-300 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 dark:text-yellow-400 drop-shadow-md"
        >
          TicketHub
        </Link>

        {/* Search Bar (Responsive) */}
        <div className="relative w-full md:w-1/3 max-w-md">
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 
                      focus:border-blue-500 dark:focus:border-yellow-400 focus:outline-none shadow-sm transition-all duration-200"
            aria-label="Search tickets"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Navigation & User Profile */}
        <div className="flex items-center space-x-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:text-blue-500 dark:hover:text-yellow-400 transition duration-200"
            aria-label="Toggle dark mode"
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
              alt="User Profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-400 dark:border-yellow-400 shadow-sm hover:shadow-blue-200 dark:hover:shadow-yellow-200 transition duration-200"
            />

            {/* Dropdown Menu (with Scale Animation) */}
            <div
              className="absolute z-50 right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md 
                            transform scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200"
            >
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                Profile
              </Link>
              <Link
                to="/logout"
                className="block px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
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
