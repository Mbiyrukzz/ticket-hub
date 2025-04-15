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
    setError,
    setLoading
  ) => {
    setLoading(true)
    setError(null)

    try {
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

      return updatedEmails
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to share ticket. Please try again.'
      setError(errorMessage)
      throw new Error(errorMessage) // Rethrow for the calling component to handle
    } finally {
      setLoading(false)
    }
  }

  const unShareTicket = async (
    ticketId,
    email,
    setLocalError,
    setLocalLoading
  ) => {
    setLocalLoading(true)
    setLocalError(null)

    const previousTickets = tickets
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
        `http://localhost:8080/users/${user.uid}/tickets/${ticketId}/unshare-ticket`,
        { email } // DELETE requests can have a body, though it's not common; alternatively, pass email in query params
      )

      const updatedEmails = response.data
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, sharedWith: updatedEmails }
            : ticket
        )
      )
      toast.success('Ticket unshared successfully!')
      return updatedEmails
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to unshare ticket. Please try again.'
      setLocalError(errorMessage)
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
