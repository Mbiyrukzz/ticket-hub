import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TicketDetailPage from './pages/TicketDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import NavBar from './components/NavBar'
import SideBar from './components/SideBar'

const MyRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar at the top */}
      <NavBar />

      {/* Sidebar + Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <SideBar className="w-64" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<Dashboard />} />
            <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default MyRoutes
