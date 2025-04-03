import React from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

const LogoutButton = () => {
  const logOut = async () => {
    try {
      await signOut(getAuth())
      console.log('✅ Successfully logged out')
    } catch (error) {
      console.error('❌ Logout failed:', error.message)
    }
  }

  return (
    <button
      onClick={logOut}
      className="flex items-center gap-3 px-5 py-3 w-full text-lg font-medium text-gray-800 dark:text-gray-300 
                 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 
                 rounded-b-lg focus:outline-none shadow-md"
    >
      <FontAwesomeIcon icon={faSignOutAlt} className="text-red-500 text-xl" />
      Logout
    </button>
  )
}

export default LogoutButton
