import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Loading from './Loading'

const ProtectedRoute = ({ canAccess, isLoading, redirectTo }) => {
  if (isLoading) return <Loading />

  return canAccess ? <Outlet /> : <Navigate to={redirectTo} replace />
}

export default ProtectedRoute
