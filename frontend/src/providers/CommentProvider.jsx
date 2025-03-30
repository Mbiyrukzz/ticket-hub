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
        if (imageFile) formData.append('image', imageFile)
        const response = await post(
          `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments`,
          formData
        )
        await fetchComments(userId, ticketId)
        return response
      } catch (error) {
        console.error('❌ Error adding comment:', error)
        setError('Failed to add comment: ' + error.message)
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
      )
        throw new Error('Missing required fields')
      setLoading(true)
      setError(null)
      try {
        const response = await put(
          `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments/${commentId}`,
          updatedData
        )
        setComments((prev) =>
          prev.map((comment) => (comment.id === commentId ? response : comment))
        )
        return response
      } catch (error) {
        console.error('❌ Failed to edit comment:', error)
        setError('Failed to update comment: ' + error.message)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [put, isReady]
  )

  const deleteComment = useCallback(
    async (userId, ticketId, commentId) => {
      if (!isReady || !userId || !ticketId || !commentId) return
      setLoading(true)
      setError(null)
      try {
        await del(
          `http://localhost:8080/users/${userId}/tickets/${ticketId}/comments/${commentId}`
        )
        setComments((prev) => {
          const updatedComments = prev.filter((c) => c.id !== commentId)
          localStorage.setItem('comments', JSON.stringify(updatedComments))
          return updatedComments
        })
      } catch (error) {
        console.error('❌ Error deleting comment:', error)
        setError('Failed to delete comment: ' + error.message)
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
