import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import TicketContext from '../contexts/TicketContext'

const TicketsProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    const cancelSubscription = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return cancelSubscription
  }, [])

  const loadTickets = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const response = await axios.get(
        `http://localhost:8080/users/${user.uid}/tickets`
      )
      console.log('📥 Fetched tickets:', response.data)

      if (Array.isArray(response.data)) {
        setTickets(response.data) // Set tickets from backend
      } else {
        console.error('❌ Unexpected API response:', response.data)
        setTickets([]) // Fallback to empty array
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      setTickets([]) // Fallback to empty array
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [user])

  const createTicket = async (ticketData) => {
    if (!user) {
      console.error('⚠️ User not authenticated!')
      return
    }

    console.log('🚀 createTicket function triggered!', ticketData)

    const { title, content, image } = ticketData
    if (!title || !content) {
      console.error('❌ Title and content are required')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    if (image instanceof File) {
      formData.append('image', image)
    }

    console.log('📤 Sending FormData:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/users/${user.uid}/tickets`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      console.log('✅ Ticket created:', response.data)
      // Refetch tickets to sync with backend (includes comments via $lookup)
      await loadTickets()
    } catch (error) {
      console.error('❌ Error creating ticket:', error.response?.data || error)
    }
  }

  const updateTicket = async (id, { title, content, image }) => {
    try {
      const formData = new FormData()
      if (title) formData.append('title', title)
      if (content) formData.append('content', content)
      if (image instanceof File) formData.append('image', image)

      const response = await axios.put(
        `http://localhost:8080/tickets/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      console.log('✅ Update response:', response.data)

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === id ? { ...ticket, ...response.data } : ticket
        )
      )
    } catch (error) {
      console.error('❌ Error updating ticket:', error.response?.data || error)
    }
  }

  const deleteTicket = async (id) => {
    if (!user) {
      console.error('⚠️ User not authenticated!')
      return
    }
    console.log('🚮 Attempting to delete ticket with ID:', id) // Debug log
    try {
      const response = await axios.delete(`http://localhost:8080/tickets/${id}`)
      console.log('✅ Ticket deleted:', response.data)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id))
    } catch (error) {
      console.error('❌ Error deleting ticket:', error.response?.data || error)
      // If backend fails, refetch to ensure consistency
      await loadTickets()
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
