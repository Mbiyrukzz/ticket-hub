import React, { useState } from 'react'

const signUpErrorMessageMap = {
  'Firebase: Error (auth/email-already-in-use)':
    'This email is already in use. Try logging in instead.',
  'Firebase: Error (auth/invalid-email)':
    'The email address you entered is invalid.',
  'Firebase: Error (auth/operation-not-allowed)':
    'Email/password sign-up is currently disabled. Please contact support.',
  'Firebase: Error (auth/weak-password)':
    'Your password is too weak. It should be at least 6 characters long.',
  'Firebase: Error (auth/missing-email)': 'Please enter an email address.',
  'Firebase: Error (auth/missing-password)': 'Please enter a password.',
  'Firebase: Error  (auth/internal-error)':
    'An internal error occurred. Please try again later.',
  'Firebase: Error (auth/network-request-failed)':
    'Network error. Please check your internet connection.',
  'Firebase: Error (auth/too-many-requests)':
    'Too many attempts. Please wait and try again later.',
}

const CreateAccountForm = ({ error, onSubmit }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const errorMessage = error
    ? signUpErrorMessageMap[`Firebase: Error (${error})`] ||
      'An unexpected error occurred. Please try again.'
    : null

  const handleSubmit = () => {
    if (password === confirmPassword) {
      onSubmit(name, email, password, confirmPassword)
    } else {
      alert('Passwords do not match!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Your Account
        </h2>

        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-sm">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-.01-10a9 9 0 100 18 9 9 0 000-18z"
              />
            </svg>
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}
        <form className="space-y-6">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Create Account Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200 shadow-md"
          >
            Create Account
          </button>
        </form>

        {/* Optional: Link to login */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="#" className="text-blue-500 hover:text-blue-400">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}

export default CreateAccountForm
