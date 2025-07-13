import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import CreateAccountForm from '../components/CreateAccountForm'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import Loading from '../components/Loading'
import './CreateAccountPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

const CreateAccountPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = Array.from({ length: 10 }).map(() => ({
        id: Math.random(),
        size: Math.random() * 60 + 20,
        left: Math.random() * 90,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 3,
      }))
      setBubbles(newBubbles)
    }
    generateBubbles()
  }, [])

  const createAccount = async (name, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      )
      const token = await result.user.getIdToken()

      await axios.post(
        `${API_URL}/api/users`,
        { name },
        { headers: { authtoken: token } }
      )

      navigate('/tickets')
    } catch (err) {
      console.error('Error creating account:', err)
      setError(err.code)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Animated Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble absolute rounded-full bg-blue-200 dark:bg-blue-400 opacity-30 dark:opacity-20"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: '-100px',
            animation: `floatUp ${bubble.duration}s infinite ease-in-out`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* Animated Cubes */}
      <div
        className="cube absolute bg-blue-300 dark:bg-blue-500 opacity-20"
        style={{
          width: '60px',
          height: '60px',
          top: '15%',
          left: '10%',
          animation: 'rotateCube 10s infinite linear',
        }}
      />
      <div
        className="cube absolute bg-purple-300 dark:bg-purple-500 opacity-20"
        style={{
          width: '45px',
          height: '45px',
          bottom: '20%',
          right: '15%',
          animation: 'rotateCube 12s infinite linear',
          animationDelay: '2s',
        }}
      />

      {/* Main Content */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fadeIn relative z-10">
        <h4 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Create An Account
        </h4>

        {loading ? (
          <div className="flex flex-col items-center space-y-4 animate-pulse">
            <Loading />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Creating your account...
            </p>
          </div>
        ) : (
          <CreateAccountForm
            error={error}
            onSubmit={createAccount}
            disabled={loading}
          />
        )}
      </div>
    </div>
  )
}

export default CreateAccountPage
