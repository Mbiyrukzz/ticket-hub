import React, { useEffect, useState, useRef } from 'react'
import TicketContext from '../contexts/TicketContext'
import { useUser } from '../hooks/useUser'
import useAuthedRequest from '../hooks/useAuthedRequest'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL

const TicketsProvider = ({ children }) => {
  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [sharedTickets, setSharedTickets] = useState([])

  const socket = useRef(null)

  // ✅ Connect to socket
  useEffect(() => {
    if (!user?.uid) return

    socket.current = io(SOCKET_URL)

    socket.current.on('connect', () => {
      console.log('✅ Connected to socket server:', socket.current.id)
    })

    // ✅ New ticket created
    socket.current.on('ticket-created', (newTicket) => {
      if (newTicket.createdBy === user.uid) return // avoid duplicate
      console.log('📥 Real-time ticket created:', newTicket)
      setTickets((prev) => [newTicket, ...prev])
    })

    // ✅ Ticket updated
    socket.current.on('ticket-updated', (updatedTicket) => {
      if (updatedTicket.createdBy !== user.uid) return
      console.log('✏️ Real-time ticket updated:', updatedTicket)
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      )
    })

    // ✅ Ticket deleted
    socket.current.on('ticket-deleted', ({ ticketId }) => {
      console.log('🗑️ Real-time ticket deleted:', ticketId)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId))
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [user?.uid])

  // ✅ Load user tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!user || !isReady) return

      setIsLoading(true)

      try {
        const { ownedTicketsWithComments, sharedWithUsersTicketsFormatted } =
          await get(`${API_URL}/api/users/${user.uid}/tickets`)

        setTickets(
          Array.isArray(ownedTicketsWithComments)
            ? ownedTicketsWithComments
            : []
        )
        setSharedTickets(
          Array.isArray(sharedWithUsersTicketsFormatted)
            ? sharedWithUsersTicketsFormatted
            : []
        )
      } catch (error) {
        console.error('❌ Error fetching tickets:', error)
        setTickets([])
        setSharedTickets([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [user, isReady, get])

  // ✅ Create ticket
  const createTicket = async (ticketData) => {
    if (!user) return

    const { title, content, image } = ticketData
    if (!title || !content) return

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    if (image instanceof File) formData.append('image', image)

    try {
      const newTicket = await post(
        `${API_URL}/api/users/${user.uid}/tickets`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      setTickets((prev) => [newTicket, ...prev])
    } catch (error) {
      console.error('❌ Error creating ticket:', error.response?.data || error)
    }
  }

  // ✅ Update ticket
  const updateTicket = async (userId, ticketId, fields = {}) => {
    try {
      const formData = new FormData()
      if (fields.title) formData.append('title', fields.title)
      if (fields.content) formData.append('content', fields.content)
      if (fields.image instanceof File) formData.append('image', fields.image)

      const updatedTicket = await put(
        `${API_URL}/users/${userId}/tickets/${ticketId}`,
        formData
      )

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
        )
      )

      return { success: true, data: updatedTicket }
    } catch (error) {
      console.error('❌ Error updating ticket:', error.response?.data || error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update ticket',
      }
    }
  }

  // ✅ Delete ticket
  const deleteTicket = async (ticketId) => {
    if (!user) return

    try {
      await del(`${API_URL}/users/${user.uid}/tickets/${ticketId}`)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId))
    } catch (error) {
      console.error('❌ Error deleting ticket:', error.response?.data || error)
    }
  }

  const shareTicket = async (ticketId, email, role) => {
    try {
      const updatedEmails = await post(
        `${API_URL}/tickets/${ticketId}/share-ticket`,
        { email, role }
      )
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, sharedWith: updatedEmails }
            : ticket
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const unshareTicket = async (ticketId, email) => {
    try {
      const updatedTicket = await del(
        `${API_URL}/tickets/${ticketId}/unshare-ticket/${email}`
      )
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, sharedWith: updatedTicket }
            : ticket
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <TicketContext.Provider
      value={{
        tickets,
        isLoading,
        sharedTickets,
        createTicket,
        deleteTicket,
        updateTicket,
        shareTicket,
        unshareTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  )
}

export default TicketsProvider
