import { useState } from 'react'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const PasswordResetForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleReset = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      await sendPasswordResetEmail(getAuth(), email)
      setMessage('✅ Email sent! Redirecting to login...')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const translated = translateError(err.code)
      setError(translated)
    } finally {
      setLoading(false)
    }
  }

  const translateError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No user found with that email.'
      case 'auth/invalid-email':
        return 'Invalid email format.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 rounded-lg shadow-md bg-white dark:bg-gray-900 dark:text-white transition-all">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Your email"
          className="w-full p-2 border rounded mb-3 dark:bg-gray-800 dark:border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>

      {(message || error) && (
        <div
          className={`mt-4 p-3 rounded border transition-opacity duration-300 ${
            message
              ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message || error}
        </div>
      )}
    </div>
  )
}

export default PasswordResetForm
