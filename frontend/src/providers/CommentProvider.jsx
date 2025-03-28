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

  const fetchComments = async (userId, ticketId) => {
    if (!userId || !ticketId) return
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments`
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

  const addComment = async (userId, ticketId, text, user, imageFile) => {
    try {
      const formData = new FormData()
      formData.append('content', text)
      formData.append('author', user || 'Anonymous')
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await axios.post(
        `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setComments((prev) => [...prev, response.data])
      console.log('✅ Added comment:', response.data)
      await fetchComments(userId, ticketId) // Sync with backend
    } catch (error) {
      console.error('❌ Error adding comment:', error.response?.data || error)
      setError('Failed to add comment.')
    }
  }

  const editComment = async (userId, ticketId, commentId, updatedData) => {
    try {
      console.log('✏️ Editing comment:', {
        userId,
        ticketId,
        commentId,
        updatedData,
      })

      if (!userId || !ticketId || !commentId || !updatedData?.content?.trim()) {
        console.error('❌ Missing required fields')
        throw new Error('Missing required fields')
      }

      const response = await fetch(
        `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments/${commentId}`,
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

      await fetchComments(userId, ticketId) // Sync with backend
      return updatedComment
    } catch (error) {
      console.error('❌ Failed to edit comment:', error.message)
      throw error
    }
  }

  const deleteComment = async (userId, ticketId, commentId) => {
    if (!userId || !ticketId || !commentId) return
    setLoading(true)
    setError(null)
    try {
      const response = await axios.delete(
        `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments/${commentId}`
      )

      if (response.status === 200 || response.status === 204) {
        setComments((prev) => {
          const updatedComments = prev.filter((c) => c.id !== commentId)
          localStorage.setItem('comments', JSON.stringify(updatedComments))
          return updatedComments
        })
        console.log('✅ Comment deleted successfully:', commentId)
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error.response?.data || error)
      setError('Failed to delete comment.')
    } finally {
      setLoading(false)
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
