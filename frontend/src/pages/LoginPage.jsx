import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import LoginForm from '../components/LoginForm'

const LoginPage = () => {
  const navigate = useNavigate()

  const logIn = async (email, password) => {
    await signInWithEmailAndPassword(getAuth(), email, password)
    navigate('/tickets')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h3>
        <LoginForm onSubmit={logIn} />
        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/create-account"
            className="text-blue-500 hover:text-blue-400 font-medium transition-all duration-200"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
