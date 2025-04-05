import React, { useState } from 'react'

const errorMessageMap = {
  'Firebase: Error (auth/invalid-email)': 'The email address is not valid.',
  'Firebase: Error (auth/user-disabled)':
    'This user account has been disabled.',
  'Firebase: Error (auth/user-not-found)': 'No account found with this email.',
  'Firebase: Error (auth/wrong-password)':
    'Incorrect password. Please try again.',
  'Firebase: Error (auth/too-many-requests)':
    'Too many failed attempts. Please try again later.',
  'Firebase: Error (auth/network-request-failed)':
    'Network error. Please check your connection.',
  'Firebase: Error (auth/internal-error)':
    'An internal error occurred. Please try again later.',
  'Firebase: Error (auth/missing-email)': 'Please enter an email address.',
  'Firebase: Error (auth/missing-password)': 'Please enter your password.',
  'Firebase: Error (auth/invalid-credential)':
    'Invalid credentials. Please try again.',
  'Firebase: Error (auth/invalid-login-credentials)':
    'Incorrect email or password.',
  'Firebase: Error (auth/operation-not-allowed)':
    'Login is currently disabled. Please contact support.',
}

const LoginForm = ({ error, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const errorMessage = error
    ? errorMessageMap[`Firebase: Error (${error})`] ||
      'An unexpected error occurred. Please try again.'
    : null

  return (
    <>
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

      <form className="space-y-4">
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
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 
                    focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-300"
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 
                    focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-300"
          />
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Remember for 30 days
          </label>
          <a href="#" className="text-purple-600 hover:text-purple-500">
            Forgot password?
          </a>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={() => onSubmit(email, password)}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-all duration-300"
        >
          Sign in
        </button>

        {/* Sign in with Google */}
        {/* <button
          type="button"
          className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2
                  hover:bg-gray-100 transition-all duration-300"
        >
          <img
            src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button> */}
      </form>
    </>
  )
}

export default LoginForm
