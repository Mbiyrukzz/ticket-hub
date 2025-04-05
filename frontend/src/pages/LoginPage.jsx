import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import LoginForm from '../components/LoginForm'
import './LoginPage.css'

const LoginPage = () => {
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const logIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password)
      navigate('/tickets')
    } catch (err) {
      setError(err.code)
    }
  }

  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = Array.from({ length: 6 }).map(() => ({
        id: Math.random(),
        size: Math.random() * 50 + 30, // More varied bubble sizes
        top: Math.random() * 90 + 5, // Random vertical position
        left: Math.random() * 70 + 20, // Random horizontal position
        duration: Math.random() * 6 + 4, // Random floating speed
      }))
      setBubbles(newBubbles)
    }
    generateBubbles()
  }, [])

  return (
    <div className="login-container">
      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            top: `${bubble.top}%`,
            left: `${bubble.left}%`,
            animationDuration: `${bubble.duration}s`,
          }}
        ></div>
      ))}

      {/* Main Login Box */}
      <div className="login-box">
        {/* Left Side: Login Form */}
        <div className="login-form-section">
          <h3>Welcome back</h3>
          <p>Please enter your details to continue.</p>
          <LoginForm error={error} onSubmit={logIn} />
          <p className="signup-text">
            Don't have an account?{' '}
            <Link to="/create-account" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right Side: Floating Abstract Shapes */}
        <div className="design-section">
          <div className="floating-circle"></div>
          <div className="floating-shadow"></div>
          <div className="floating-cube"></div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
