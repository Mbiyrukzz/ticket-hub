import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import CreateAccountForm from '../components/CreateAccountForm'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import Loading from '../components/Loading'

const CreateAccountPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createAccount = async (name, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null) // Reset error state

    try {
      const result = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      )
      const token = await result.user.getIdToken() // Ensure you await the token retrieval

      await axios.post(
        'http://localhost:8080/users',
        { name },
        { headers: { authtoken: token } }
      )

      navigate('/tickets')
    } catch (err) {
      console.error('Error creating account:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fadeIn">
        {/* Page Heading */}
        <h4 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create An Account
        </h4>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded-md text-center mb-4 animate-fadeIn">
            {error}
          </p>
        )}

        {/* Form or Loading State */}
        {loading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loading />
            <p className="text-lg text-gray-600">Creating account...</p>
          </div>
        ) : (
          <CreateAccountForm onSubmit={createAccount} disabled={loading} />
        )}
      </div>
    </div>
  )
}

export default CreateAccountPage
