import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import ThemeContext from '../contexts/ThemeContext'
import LogoutButton from './LogoutButton'
import Loading from './Loading'

const NavBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return <Loading />
  }

  // If no user is logged in, don't render the navbar
  if (!user) {
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md transition-all duration-300 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-4 flex items-center">
        {/* Logo - Show only if user is logged in */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-600 dark:text-yellow-400 drop-shadow-md hover:text-blue-700 dark:hover:text-yellow-300 transition-all tracking-wide"
        >
          TicketHub
        </Link>

        {/* Search Bar - Show only if user is logged in */}
        <div className="relative w-full md:w-1/3 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full border border-gray-300 dark:border-gray-600 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 focus:outline-none shadow-md transition-all duration-200"
            aria-label="Search tickets"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-5 top-4 text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Actions - Always align to the far right */}
        <div className="ml-auto flex items-center space-x-6">
          {/* Dark Mode Toggle - Always Visible */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-yellow-400 transition duration-200 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 shadow-md"
            aria-label="Toggle dark mode"
          >
            <FontAwesomeIcon
              icon={theme === 'dark' ? faSun : faMoon}
              className="text-xl text-gray-700 dark:text-gray-300"
            />
          </button>

          {/* If user is logged in, show avatar and logout */}
          <div className="relative group">
            <button className="flex items-center">
              <img
                src={user.photoURL} // Use Firebase user avatar if available
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-blue-400 dark:border-yellow-400 shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
              />
            </button>

            {/* Dropdown Menu */}
            <div
              className="absolute z-50 right-0 mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg 
                    transform scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200"
            >
              <Link
                to="/profile"
                className="block px-5 py-3 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-all font-medium"
              >
                Profile
              </Link>
              <div className="border-t border-gray-300 dark:border-gray-600"></div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
