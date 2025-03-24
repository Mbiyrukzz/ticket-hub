import React, { useState } from 'react'

const CreateAccountForm = ({ onSubmit }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <>
      <input
        type="text"
        placeholder="Enter your email address..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="email"
        placeholder="Enter your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password..."
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={() => onSubmit(name, email, password, confirmPassword)}>
        Create Account
      </button>
    </>
  )
}

export default CreateAccountForm
