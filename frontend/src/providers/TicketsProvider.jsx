import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import TicketContext from '../contexts/TicketContext'
import { useUser } from '../hooks/useUser'
import useAuthedRequest from '../hooks/useAuthedRequest'

const TicketsProvider = ({ children }) => {
  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [sharedTickets, setSharedTickets] = useState([])

  useEffect(() => {
    const loadTickets = async () => {
      if (!user || !isReady) return

      setIsLoading(true)

      try {
        const { ownedTicketsWithComments, sharedWithUsersTicketsFormatted } =
          await get(`http://localhost:8080/users/${user.uid}/tickets`)

        console.log('📥 Fetched tickets:', {
          ownedTicketsWithComments,
          sharedWithUsersTicketsFormatted,
        })

        if (Array.isArray(ownedTicketsWithComments)) {
          setTickets(ownedTicketsWithComments)
        } else {
          console.error('❌ Unexpected ownedTickets structure')
          setTickets([])
        }

        if (Array.isArray(sharedWithUsersTicketsFormatted)) {
          setSharedTickets(sharedWithUsersTicketsFormatted)
        } else {
          console.error('❌ Unexpected sharedTickets structure')
          setSharedTickets([])
        }
      } catch (error) {
        console.error('❌ Error fetching tickets:', error)
        setTickets([])
        setSharedTickets([])
      } finally {
        setIsLoading(false)
      }
    }

    if (user && isReady) {
      loadTickets()
    }
  }, [user, isReady, get])

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

  const shareTicket = async (
    ticketId,
    email,
    optionalMessage,
    setTickets,
    setShareLoading
  ) => {
    try {
      setShareLoading(true)
      console.log('Sending share request:', {
        ticketId,
        email,
        optionalMessage,
      })

      const response = await post(
        `http://localhost:8080/users/${user.uid}/tickets/${ticketId}/share-ticket`,
        { email, optionalMessage }
      )

      const updatedEmails = response.data

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                sharedWith: updatedEmails,
              }
            : ticket
        )
      )

      return { success: true }
    } catch (error) {
      console.error('Error sharing ticket:', error)

      const message = error?.response?.data?.message || 'Failed to share ticket'

      // Optional: show toast or notification instead
      // toast.error(message)

      return { success: false, message }
    } finally {
      setShareLoading(false)
    }
  }

  const unShareTicket = async (ticketId, email, setLocalLoading) => {
    setLocalLoading(true)

    // Backup previous state for rollback
    const previousTickets = tickets

    // Optimistically update UI
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              sharedWith: (ticket.sharedWith || []).filter(
                (shared) => shared.email !== email
              ),
            }
          : ticket
      )
    )

    try {
      const response = await del(
        `http://localhost:8080/users/${user.uid}/tickets/${ticketId}/unshare-ticket/${email}`
      )

      const updatedTicket = response.data.ticket

      // Sync UI with backend's latest state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket
        )
      )

      toast.success('Ticket unshared successfully!')
      return updatedTicket.sharedWith
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to unshare ticket. Please try again.'

      // Rollback on failure
      setTickets(previousTickets)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLocalLoading(false)
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
        unShareTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  )
}

export default TicketsProvider
