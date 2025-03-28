import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TicketDetailPage from './pages/TicketDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import NavBar from './components/NavBar'
import SideBar from './components/SideBar'
import Activities from './components/Activities'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useUser } from './hooks/useUser'

const MyRoutes = () => {
  const { user, isLoading } = useUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <NavBar />

      <div className="flex flex-1">
        {isLoggedIn && (
          <SideBar className="w-64 border-r border-gray-300 bg-gray-100 shadow-md" />
        )}

        <div
          className={`flex-1 p-6 transition-all duration-300 ${
            !isLoggedIn ? 'w-full' : ''
          }`}
        >
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/tickets" replace /> : <LoginPage />
              }
            />
            <Route
              path="/create-account"
              element={
                isLoggedIn ? (
                  <Navigate to="/tickets" replace />
                ) : (
                  <CreateAccountPage />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute
                  canAccess={isLoggedIn}
                  isLoading={isLoading}
                  redirectTo="/login"
                />
              }
            >
              <Route path="/tickets" element={<Dashboard />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/tickets" replace />} />

            {/* Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        {isLoggedIn && (
          <div className="mt-6">
            <Activities />
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRoutes
