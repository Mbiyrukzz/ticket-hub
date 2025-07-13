import React from 'react'
import ResolvedTicketList from '../components/ResolvedTicketList'

const ResolvedTicketsPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Resolved Tickets</h1>
      <ResolvedTicketList />
    </div>
  )
}

export default ResolvedTicketsPage
