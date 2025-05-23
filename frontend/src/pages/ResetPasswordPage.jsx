import React from 'react'
import PasswordResetForm from '../components/ResetPasswordForm'

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6 dark:text-white">
          Reset Your Password
        </h1>
        <PasswordResetForm />
      </div>
    </div>
  )
}

export default ResetPasswordPage
