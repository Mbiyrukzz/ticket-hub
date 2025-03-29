import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CreateAccountForm from '../components/CreateAccountForm'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const CreateAccountPage = () => {
  const navigate = useNavigate()

  const createAccount = async (name, email, password, confirmPassword) => {
    if (password === confirmPassword) {
      await createUserWithEmailAndPassword(getAuth(), name, email, password)
      navigate('/tickets')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h4 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create An Account
        </h4>
        <CreateAccountForm onSubmit={createAccount} />
      </div>
    </div>
  )
}

export default CreateAccountPage
