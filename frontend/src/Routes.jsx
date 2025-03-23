import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TicketDetailPage from './pages/TicketDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import NavBar from './components/NavBar'
import SideBar from './components/SideBar'
import Activites from './components/Activities'

const MyRoutes = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar at the top */}
      <NavBar />

      {/* Sidebar + Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <SideBar className="w-64 border-r border-gray-300 bg-gray-100 shadow-md" />

        {/* Main Content */}
        <div className="flex-1 p-6 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<Dashboard />} />
            <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <div className="mt-6">
          <Activites />
        </div>
      </div>
    </div>
  )
}

export default MyRoutes
