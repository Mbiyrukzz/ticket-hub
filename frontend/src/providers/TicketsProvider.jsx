import React, { useEffect, useState } from 'react'
import TicketContext from '../contexts/TicketContext'
import { useUser } from '../hooks/useUser'
import useAuthedRequest from '../hooks/useAuthedRequest'
import useSocket from '../hooks/useSocket'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

const TicketsProvider = ({ children }) => {
  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()
  const { socket, isConnected } = useSocket()

  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [sharedTickets, setSharedTickets] = useState([])
  const [resolvedTickets, setResolvedTickets] = useState([])

  const [offset, setOffset] = useState(0)
  const [limit] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  // ✅ Real-time ticket events
  useEffect(() => {
    if (!user?.uid || !socket || !isConnected) return

    const handleCreated = (newTicket) => {
      if (
        newTicket.createdBy === user.uid ||
        newTicket.createdFor === user.uid ||
        newTicket.assignedTo === user.uid
      ) {
        const ticketWithPost = {
          ...newTicket,
          post: newTicket.createdFor === user.uid ? 'createdFor' : 'owner',
        }
        setTickets((prev) => {
          if (prev.some((t) => t.id === ticketWithPost.id)) return prev
          return [ticketWithPost, ...prev]
        })
      }
    }

    const handleUpdated = (updatedTicket) => {
      const isOwner = updatedTicket.createdBy === user.uid
      const isShared = sharedTickets.some((t) => t.id === updatedTicket.id)
      const isCreatedFor = updatedTicket.createdFor === user.uid
      const isAssignedTo = updatedTicket.assignedTo === user.uid
      if (!isOwner && !isShared && !isCreatedFor && !isAssignedTo) return

      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      )
    }

    const handleDeleted = ({ ticketId }) => {
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
    }

    socket.on('ticket-created', handleCreated)
    socket.on('ticket-updated', handleUpdated)
    socket.on('ticket-deleted', handleDeleted)

    return () => {
      socket.off('ticket-created', handleCreated)
      socket.off('ticket-updated', handleUpdated)
      socket.off('ticket-deleted', handleDeleted)
    }
  }, [user?.uid, socket, isConnected, sharedTickets])

  // ✅ Load user's tickets with pagination
  const loadTickets = async (reset = false) => {
    if (!user || !user.uid || !isReady) return

    const currentOffset = reset ? 0 : offset

    setIsLoading(true)

    try {
      const res = await get(
        `${API_URL}/api/users/${user.uid}/tickets?offset=${currentOffset}&limit=${limit}`
      )

      const {
        ownedTicketsWithComments = [],
        sharedWithUsersTicketsFormatted = [],
        createdForTickets = [],
      } = res

      const owned = ownedTicketsWithComments.map((t) => ({
        ...t,
        post: 'owner',
      }))
      const shared = sharedWithUsersTicketsFormatted.map((t) => ({
        ...t,
        post: 'shared',
      }))
      const createdFor = createdForTickets.map((t) => ({
        ...t,
        post: 'createdFor',
      }))

      const all = [...owned, ...createdFor]

      if (reset) {
        setTickets(all)
        setSharedTickets(shared)
        setOffset(limit)
      } else {
        setTickets((prev) => [...prev, ...all])
        setSharedTickets((prev) => [...prev, ...shared])
        setOffset(currentOffset + limit)
      }

      // If we got fewer than requested, no more results
      if (all.length < limit && shared.length < limit) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error)
      if (reset) {
        setTickets([])
        setSharedTickets([])
      }
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔁 Load on mount/reset
  useEffect(() => {
    loadTickets(true)
  }, [user, isReady])

  const loadResolvedTickets = async (offset = 0, limit = 10, reset = false) => {
    if (!user?.uid || !isReady) return

    try {
      const res = await get(
        `${API_URL}/api/users/${user.uid}/tickets/resolved?offset=${offset}&limit=${limit}`
      )
      const tickets = res.resolvedTickets || []
      console.log('Resolved tickets:', tickets)
      if (reset) {
        setResolvedTickets(tickets) // Reset state
      } else {
        setResolvedTickets((prev) => [...prev, ...tickets]) // Append for pagination
      }
      return tickets
    } catch (err) {
      console.error('❌ Failed to load resolved tickets:', err)
      setResolvedTickets([])
      return []
    }
  }

  // Load resolved tickets on mount/reset
  useEffect(() => {
    loadResolvedTickets(0, 10, true)
  }, [user, get, isReady])

  // ✅ Create ticket
  const createTicket = async ({ title, content, image }) => {
    if (!user || !title || !content) return

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
        `${API_URL}/api/users/${userId}/tickets/${ticketId}`,
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
      await del(`${API_URL}/api/users/${user.uid}/tickets/${ticketId}`)
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
        resolvedTickets,
        createTicket,
        deleteTicket,
        updateTicket,
        setTickets,
        shareTicket,
        unshareTicket,
        socket,
        loadMoreTickets: () => loadTickets(false),
        loadResolvedTickets,
        hasMore,
      }}
    >
      {children}
    </TicketContext.Provider>
  )
}

export default TicketsProvider
