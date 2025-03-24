import React, { useState } from 'react'

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <>
      <input
        type="text"
        placeholder="example@mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => onSubmit(email, password)}>Login</button>
    </>
  )
}

export default LoginForm
