import { useState, useMemo, useCallback } from 'react'
import CommentContext from '../contexts/CommentContext'
import useAuthedRequest from '../hooks/useAuthedRequest'
import { useUser } from '../hooks/useUser'

const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()

  const fetchComments = useCallback(
    async (userId, ticketId) => {
      if (!userId || !ticketId || !isReady) return
      setLoading(true)
      setError(null)
      try {
        const response = await get(
          `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments`
        )
        const newComments = Array.isArray(response.data) ? response.data : []
        setComments((prev) => [
          ...prev.filter((c) => c.ticketId !== ticketId),
          ...newComments,
        ])
      } catch (error) {
        console.error('❌ Error fetching comments:', error)
        setError('Failed to fetch comments: ' + error.message)
      } finally {
        setLoading(false)
      }
    },
    [get, isReady]
  )

  const addComment = useCallback(
    async (userId, ticketId, text, imageFile) => {
      if (!isReady || !userId || !ticketId || !text?.trim()) return
      setLoading(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append('content', text)
        formData.append('author', user?.displayName || 'Anonymous')
        if (imageFile) {
          console.log(
            'Adding image:',
            imageFile.name,
            imageFile.size,
            imageFile.type
          )
          formData.append('image', imageFile)
        }
        console.log(
          'Sending comment to:',
          `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments`
        )
        const response = await post(
          `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments`,
          formData
        )
        console.log('Add comment response:', response)
        await fetchComments(userId, ticketId)
        return response
      } catch (error) {
        console.error(
          '❌ Error adding comment:',
          error.response?.data || error.message
        )
        setError(
          'Failed to add comment: ' +
            (error.response?.data?.message || error.message)
        )
        throw error
      } finally {
        setLoading(false)
      }
    },
    [post, isReady, user, fetchComments]
  )

  const editComment = useCallback(
    async (userId, ticketId, commentId, updatedData) => {
      if (
        !isReady ||
        !userId ||
        !ticketId ||
        !commentId ||
        !updatedData?.content?.trim()
      ) {
        console.log('⚠️ Missing required fields:', {
          userId,
          ticketId,
          commentId,
          content: updatedData?.content,
        })
        throw new Error('Missing required fields')
      }

      setLoading(true)
      setError(null)

      try {
        // Log the request details
        console.log('🔍 Edit Comment Request Details:', {
          userId,
          ticketId,
          commentId,
          timestamp: new Date().toISOString(),
        })

        // Make the PUT request to the updated endpoint
        const response = await put(
          `http://localhost:8080/tickets/${ticketId}/comments/${commentId}`,
          updatedData
        )

        // Log success
        console.log('✅ Comment updated successfully:', { commentId })

        // Update the comments state
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? response.updatedComment : comment
          )
        )

        // Optionally set a success message (if your app supports it)
        // setSuccess('Comment updated successfully');

        return response.updatedComment
      } catch (error) {
        // Log the error with details
        console.error('❌ Error updating comment:', {
          message: error.message,
          response: error.response?.data, // Capture backend error details if available
        })

        // Set a user-friendly error message
        const errorMessage =
          error.response?.data?.error || 'Failed to update comment'
        setError(`${errorMessage}: ${error.message}`)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [put, isReady]
  )

  const deleteComment = useCallback(
    async (userId, ticketId, commentId) => {
      if (!isReady || !userId || !ticketId || !commentId) {
        console.log('⚠️ Missing required parameters:', {
          userId,
          ticketId,
          commentId,
        })
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Log the request details
        console.log('🔍 Delete Comment Request Details:', {
          userId,
          ticketId,
          commentId,
          timestamp: new Date().toISOString(),
        })

        // Make the DELETE request to the updated endpoint
        await del(
          `http://localhost:8080/tickets/${ticketId}/comments/${commentId}`
        )

        // Log success
        console.log('✅ Comment deleted successfully:', { commentId })

        // Update the comments state
        setComments((prev) => {
          const updatedComments = prev.filter((c) => c.id !== commentId)
          return updatedComments
        })

        // Optionally set a success message (if your app supports it)
        // setSuccess('Comment deleted successfully');
      } catch (error) {
        // Log the error with details
        console.error('❌ Error deleting comment:', {
          message: error.message,
          response: error.response?.data, // Capture backend error details if available
        })

        // Set a user-friendly error message
        const errorMessage =
          error.response?.data?.error || 'Failed to delete comment'
        setError(`${errorMessage}: ${error.message}`)
      } finally {
        setLoading(false)
      }
    },
    [del, isReady]
  )

  const getCommentsByTicketId = useCallback(
    (ticketId) => comments.filter((comment) => comment.ticketId === ticketId),
    [comments]
  )

  const contextValue = useMemo(
    () => ({
      comments,
      loading,
      error,
      addComment,
      deleteComment,
      editComment,
      getCommentsByTicketId,
      fetchComments,
    }),
    [
      comments,
      loading,
      error,
      addComment,
      deleteComment,
      editComment,
      fetchComments,
      getCommentsByTicketId,
    ]
  )

  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  )
}

export default CommentProvider
