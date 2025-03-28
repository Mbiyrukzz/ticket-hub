import React, { useEffect, useState } from 'react'
import TicketContext from '../contexts/TicketContext'
import { useUser } from '../hooks/useUser'
import useAuthedRequest from '../hooks/useAuthedRequest'

const TicketsProvider = ({ children }) => {
  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    const loadTickets = async () => {
      if (!user || !isReady) return

      setIsLoading(true)

      try {
        const fetchedTickets = await get(
          `http://localhost:8080/users/${user.uid}/tickets`
        )
        console.log('📥 Fetched tickets:', fetchedTickets)

        if (Array.isArray(fetchedTickets)) {
          setTickets(fetchedTickets)
        } else {
          console.error('❌ Unexpected API response:', fetchedTickets)
          setTickets([]) // Fallback to empty array
        }
      } catch (error) {
        console.error('❌ Error fetching tickets:', error)
        setTickets([]) // Fallback to empty array
      } finally {
        setIsLoading(false)
      }
    }

    if (user && isReady) {
      loadTickets()
    }
  }, [user, isReady, get]) // ✅ Removed `get` to avoid unnecessary re-fetching

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

    try {
      const newTicket = await post(
        `http://localhost:8080/users/${user.uid}/tickets`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      console.log('✅ Ticket created:', newTicket)

      setTickets((prevTickets) => [newTicket, ...prevTickets]) // ✅ Update state with new ticket
    } catch (error) {
      console.error('❌ Error creating ticket:', error.response?.data || error)
    }
  }

  const updateTicket = async (
    userId,
    ticketId,
    { title, content, image } = {}
  ) => {
    try {
      const formData = new FormData()
      if (title) formData.append('title', title)
      if (content) formData.append('content', content)
      if (image instanceof File) formData.append('image', image)

      const updatedTicket = await put(
        `http://localhost:8080/users/${userId}/tickets/${ticketId}`,
        formData
      )

      console.log('✅ Update response:')

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, ...updatedTicket }
            : { ...ticket }
        )
      )

      return { success: true, data: updatedTicket }
    } catch (error) {
      console.error('❌ Error updating ticket:', error.response?.data || error)
      const errorMessage =
        error.response?.data?.error || 'Failed to update ticket'
      return { success: false, error: errorMessage }
    }
  }

  const deleteTicket = async (ticketId) => {
    if (!user) {
      console.error('⚠️ User not authenticated!')
      return
    }

    console.log('🚮 Attempting to delete ticket with ID:', ticketId)

    try {
      await del(`http://localhost:8080/users/${user.uid}/tickets/${ticketId}`) // ✅ Ensuring correct API URL

      console.log('✅ Ticket deleted:', ticketId)

      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId))
    } catch (error) {
      console.error('❌ Error deleting ticket:', error.response?.data || error)
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
