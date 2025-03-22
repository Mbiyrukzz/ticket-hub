import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TicketContext from '../contexts/TicketContext'

const TicketsProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await axios.get('http://localhost:8080/tickets')
        setTickets(response.data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [])

  const createTicket = async ({ title, content, image }) => {
    console.log('🚀 createTicket function triggered!')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    if (image) formData.append('image', image)

    console.log('📤 Sending FormData:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/tickets',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      console.log('✅ Ticket created:', response.data)
      setTickets((prev) => [...prev, response.data]) // ✅ Update state
    } catch (error) {
      console.error('❌ Error creating ticket:', error.response?.data || error)
    }
  }

  const updateTicket = async (id, { title, content, image }) => {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    if (image) formData.append('image', image) // Append only if updating image

    try {
      const response = await axios.put(
        `http://localhost:8080/tickets/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === id ? response.data : ticket))
      ) // ✅ Update state after update
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/tickets/${id}`)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id)) // ✅ Remove from state
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  return (
    <TicketContext.Provider
      value={{ tickets, isLoading, createTicket, deleteTicket, updateTicket }}
    >
      {children}
    </TicketContext.Provider>
  )
}

export default TicketsProvider
