import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import LogoutButton from './LogoutButton'
import Loading from './Loading'
import { useUser } from '../hooks/useUser'

const NavBar = () => {
  const { isLoading, user } = useUser()
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const toggleDropdown = () => setShowDropdown((prev) => !prev)
  const closeDropdown = () => setShowDropdown(false)

  if (loading || isLoading) return <Loading />
  if (!user) return null

  return (
    <nav className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 shadow-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 tracking-wide transition"
        >
          TicketHub
        </Link>

        {/* Right Side: User Info */}
        <div className="flex items-center space-x-5 sm:space-x-6 relative">
          <div className="relative flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                {user.name || user.email}
              </p>
              <span className="text-xs text-green-500">Online</span>
            </div>

            <button
              onClick={toggleDropdown}
              className="focus:outline-none group"
              aria-label="User menu"
            >
              <img
                src={user.photoURL || '/defimage.jpg'}
                alt="User Avatar"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-500 shadow-md group-hover:shadow-lg transition duration-200"
              />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 transition-all duration-200 animate-fadeIn"
                onMouseLeave={closeDropdown}
              >
                <Link
                  to="/profile"
                  onClick={closeDropdown}
                  className="block px-5 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl transition"
                >
                  Profile
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700" />
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
