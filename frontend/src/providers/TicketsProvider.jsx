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
        console.log('Fetched tickets:', response.data)
        setTickets(response.data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTickets()
  }, [])

  const createTicket = async (ticketData) => {
    console.log('🚀 createTicket function triggered!')
    console.log('Received Data:', ticketData)

    const { title, content, image } = ticketData

    if (!title || !content) {
      console.error('Title and content are required')
      return
    }

    console.log(
      'Image Type:',
      image instanceof File ? '✅ File' : '❌ Not a File'
    )

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)

    if (image instanceof File) {
      formData.append('image', image)
    } else {
      console.warn('⚠️ Image is NOT a File object:', image)
    }

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
      setTickets((prev) => [...prev, response.data])
    } catch (error) {
      console.error('❌ Error creating ticket:', error.response?.data || error)
    }
  }

  const updateTicket = async (id, { title, content, image }) => {
    console.log('🚀 updateTicket function triggered!')
    console.log('Image type:', image instanceof File ? 'File' : typeof image)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)

    if (image instanceof File) {
      formData.append('image', image)
    }

    console.log('Updating FormData:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/tickets/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      console.log('✅ Update response:', response.data)

      // ✅ Ensure state updates immediately
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
    try {
      await axios.delete(`http://localhost:8080/tickets/${id}`)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id))
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
