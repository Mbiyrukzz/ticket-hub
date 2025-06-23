import React, { useEffect, useState } from 'react'

import TicketContext from '../contexts/TicketContext'
import { useUser } from '../hooks/useUser'
import useAuthedRequest from '../hooks/useAuthedRequest'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

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
          await get(`${API_URL}/api/users/${user.uid}/tickets`)

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
        `${API_URL}/api/users/${user.uid}/tickets`,
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
        `${API_URL}/users/${userId}/tickets/${ticketId}`,
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
      await del(`${API_URL}/users/${user.uid}/tickets/${ticketId}`) // ✅ Ensuring correct API URL

      console.log('✅ Ticket deleted:', ticketId)

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
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, sharedWith: updatedEmails }
            : ticket
        )
      )
    } catch (error) {
      console.log(error)
    }
  }

  const unshareTicket = async (ticketId, email) => {
    try {
      const updatedTicket = await del(
        `${API_URL}/tickets/${ticketId}/unshare-ticket/${email}`
      )
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                sharedWith: updatedTicket,
              }
            : ticket
        )
      )
    } catch (error) {
      console.log(error)
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
