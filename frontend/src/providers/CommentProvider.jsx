import { useState } from 'react'
import axios from 'axios'
import CommentContext from '../contexts/CommentContext'

const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('comments')
    return savedComments ? JSON.parse(savedComments) : []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchComments = async (ticketId) => {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `http://localhost:8080/tickets/${ticketId}/comments`
      )
      setComments((prev) => {
        const otherComments = prev.filter((c) => c.ticketId !== ticketId)
        const updatedComments = [...otherComments, ...response.data]
        localStorage.setItem('comments', JSON.stringify(updatedComments))
        return updatedComments
      })
      console.log('✅ Fetched comments for ticket:', ticketId, response.data)
    } catch (error) {
      console.error(
        '❌ Error fetching comments:',
        error.response?.data || error
      )
      setError('Failed to fetch comments.')
    } finally {
      setLoading(false)
    }
  }

  const addComment = async (ticketId, text, user) => {
    const newComment = { ticketId, content: text, author: user || 'Anonymous' }
    try {
      const response = await axios.post(
        `http://localhost:8080/tickets/${ticketId}/comments`,
        newComment
      )
      setComments((prev) => {
        const updated = [...prev, response.data]
        localStorage.setItem('comments', JSON.stringify(updated))
        return updated
      })
      console.log('✅ Added comment:', response.data)
      await fetchComments(ticketId) // Fetch latest comments after adding
    } catch (error) {
      console.error('❌ Error adding comment:', error.response?.data || error)
      setError('Failed to add comment.')
    }
  }

  const editComment = async (ticketId, commentId, updatedData) => {
    try {
      console.log('✏️ Editing comment:', { ticketId, commentId, updatedData })

      if (!ticketId || !commentId || !updatedData?.content?.trim()) {
        console.error('❌ Missing required fields')
        throw new Error('Missing required fields')
      }

      const response = await fetch(
        `http://localhost:8080/tickets/${ticketId}/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error updating comment:', errorData)
        throw new Error(errorData.error || 'Failed to update comment')
      }

      const updatedComment = await response.json()
      console.log('✅ Comment updated successfully:', updatedComment)

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      )

      // Optional: Refetch to ensure sync with backend
      await fetchComments(ticketId)

      return updatedComment
    } catch (error) {
      console.error('❌ Failed to edit comment:', error.message)
      throw error
    }
  }

  const deleteComment = async (ticketId, commentId) => {
    try {
      console.log('Attempting to delete comment with ID:', commentId)
      await axios.delete(
        `http://localhost:8080/tickets/${ticketId}/comments/${commentId}`
      )
      setComments((prev) => {
        const updated = prev.filter((comment) => comment.id !== commentId)
        localStorage.setItem('comments', JSON.stringify(updated))
        return updated
      })
      await fetchComments(ticketId) // Sync after delete
    } catch (error) {
      console.error('❌ Error deleting comment:', error.response?.data || error)
      setError('Failed to delete comment.')
    }
  }

  const getCommentsByTicketId = (ticketId) => {
    const ticketComments = comments.filter(
      (comment) => comment.ticketId === ticketId
    )
    console.log('🔍 Comments for ticket:', ticketId, ticketComments)
    return ticketComments
  }

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        error,
        addComment,
        deleteComment,
        editComment,
        getCommentsByTicketId,
        fetchComments,
      }}
    >
      {children}
    </CommentContext.Provider>
  )
}

export default CommentProvider
