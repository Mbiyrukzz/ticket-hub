import React, { useState } from 'react'

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Back
        </h2>
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Email
            </label>
            <input
              type="email" // Changed to type="email" for better validation
              id="email"
              placeholder="example@mail.com"
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
              type="password" // Changed to type="password" for security
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={() => onSubmit(email, password)}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200 shadow-md"
          >
            Login
          </button>
        </form>

        {/* Optional: Add a link for forgot password or signup */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Forgot your password?{' '}
          <a href="#" className="text-blue-500 hover:text-blue-400">
            Reset it
          </a>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
