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
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
  }

  const closeDropdown = () => setShowDropdown(false)

  if (loading) return <Loading />
  if (!user) return null

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-300 transition-all tracking-wide"
        >
          TicketHub
        </Link>

        {/* Search */}
        <div className="relative w-full max-w-md mx-4 hidden md:block">
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-5 pr-10 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full border border-gray-300 dark:border-gray-600 
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 outline-none shadow-sm transition-all duration-200"
            aria-label="Search tickets"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 sm:space-x-6 relative">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-3 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-yellow-400 transition duration-200 
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 shadow-md"
            aria-label="Toggle dark mode"
          >
            <FontAwesomeIcon
              icon={theme === 'dark' ? faSun : faMoon}
              className="text-lg sm:text-xl text-gray-700 dark:text-gray-300"
            />
          </button>

          {/* Avatar and Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center focus:outline-none"
              aria-label="User menu"
            >
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt="User Avatar"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400 dark:border-yellow-400 shadow-md hover:shadow-lg transition duration-200"
              />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 animate-fadeIn"
                onMouseLeave={closeDropdown}
              >
                <Link
                  to="/profile"
                  onClick={closeDropdown}
                  className="block px-5 py-3 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl transition-all font-medium"
                >
                  Profile
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-600" />
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
