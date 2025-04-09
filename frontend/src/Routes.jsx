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
import './customScroll.css' // Import custom styles
import UsersProfilePage from './pages/UsersProfilePage'
import TicketSharingPage from './pages/TicketSharingPage'

const MyRoutes = () => {
  const { user, isLoading } = useUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <NavBar />

      <div className="flex flex-1">
        {/* Sidebar (Sticky, Unique Scroll) */}
        {isLoggedIn && (
          <SideBar className="sticky top-0 h-screen w-60 border-r border-gray-300 bg-gray-100 shadow-md overflow-y-auto custom-sidebar-scroll" />
        )}

        {/* Main content and activities */}
        <div className="flex flex-1 overflow-hidden">
          {/* Routes Section (Unique Scroll Style) */}
          <div className="flex-grow p-4 overflow-y-auto max-h-screen custom-routes-scroll">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  isLoggedIn ? (
                    <Navigate to="/tickets" replace />
                  ) : (
                    <LoginPage />
                  )
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
                {' '}
                <Route path="/profile" element={<UsersProfilePage />} />
                <Route path="/tickets" element={<Dashboard />} />
                <Route
                  path="/tickets/:ticketId"
                  element={<TicketDetailPage />}
                />
                <Route
                  path="/sharing/:ticketId"
                  element={<TicketSharingPage />}
                />
              </Route>

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/tickets" replace />} />

              {/* Not Found Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>

          {/* Activities Section (Smaller Unique Scroll) */}
          {isLoggedIn && (
            <div className="w-2/6 p-4 overflow-y-auto max-h-screen custom-activities-scroll">
              <Activities />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyRoutes
