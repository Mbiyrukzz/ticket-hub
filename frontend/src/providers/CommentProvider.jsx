import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import CommentContext from '../contexts/CommentContext'
import useAuthedRequest from '../hooks/useAuthedRequest'
import { useUser } from '../hooks/useUser'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL

const CommentProvider = ({ children }) => {
  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()

  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [highlightedIds, setHighlightedIds] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  const socketRef = useRef(null)

  // 🔌 Socket setup
  useEffect(() => {
    if (!user?.uid) return

    socketRef.current = io(SOCKET_URL)

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id)
    })

    socketRef.current.on('comment-created', (comment) => {
      setComments((prev) => {
        const exists = prev.some((c) => c.id === comment.id)
        return exists ? prev : [...prev, comment]
      })
      setHighlightedIds((prev) => [...prev, comment.id])
      setTimeout(() => {
        setHighlightedIds((prev) => prev.filter((id) => id !== comment.id))
      }, 3000)
    })

    socketRef.current.on('comment-updated', (updated) => {
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      )
    })

    socketRef.current.on('comment-deleted', (commentId) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    })

    socketRef.current.on('users-typing', (users) => {
      const currentName = user?.displayName || user?.userName
      setTypingUsers(users.filter((u) => u !== currentName))
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user])

  // 📥 Load Comments for ticket
  const fetchComments = useCallback(
    async (userId, ticketId) => {
      if (!userId || !ticketId || !isReady) return
      setIsLoading(true)
      setError(null)
      try {
        const res = await get(`${API_URL}/api/tickets/${ticketId}/comments`)
        const incoming = Array.isArray(res.comments) ? res.comments : []
        setComments((prev) => [
          ...prev.filter((c) => c.ticketId !== ticketId),
          ...incoming,
        ])
      } catch (err) {
        setError(
          err?.response?.status === 403
            ? 'You are not authorized to view these comments.'
            : 'Error loading comments.'
        )
        console.error('❌ fetchComments failed:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [get, isReady]
  )

  // ➕ Add
  const addComment = useCallback(
    async (userId, ticketId, content, imageFile, parentId = null) => {
      if (!userId || !ticketId || !content?.trim() || !isReady) return
      const formData = new FormData()
      formData.append('content', content)
      if (imageFile) formData.append('image', imageFile)
      if (parentId) formData.append('parentId', parentId)

      try {
        const { comment } = await post(
          `${API_URL}/api/tickets/${ticketId}/comments`,
          formData
        )
        setComments((prev) => [...prev, comment])
        socketRef.current?.emit('new-comment', { ticketId, comment })
        return comment
      } catch (err) {
        console.error('❌ Failed to add comment:', err)
        setError('Failed to add comment.')
        throw err
      }
    },
    [post, isReady]
  )

  // ✏️ Edit
  const editComment = useCallback(
    async (userId, ticketId, commentId, updatedData) => {
      if (!updatedData?.content?.trim()) return
      try {
        const res = await put(
          `${API_URL}/tickets/${ticketId}/comments/${commentId}`,
          updatedData
        )
        const updated = res?.updatedComment
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updated : c))
        )
        socketRef.current?.emit('update-comment', {
          ticketId,
          comment: updated,
        })
        return updated
      } catch (err) {
        console.error('❌ Failed to edit comment:', err)
        setError('Failed to edit comment.')
        throw err
      }
    },
    [put]
  )

  // ❌ Delete
  const deleteComment = useCallback(
    async (userId, ticketId, commentId) => {
      try {
        await del(`${API_URL}/tickets/${ticketId}/comments/${commentId}`)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        socketRef.current?.emit('delete-comment', { ticketId, commentId })
      } catch (err) {
        console.error('❌ Failed to delete comment:', err)
        setError('Failed to delete comment.')
        throw err
      }
    },
    [del]
  )

  // ✏️ Typing
  const emitTyping = (ticketId) => {
    if (!user?.displayName || !ticketId) return
    socketRef.current?.emit('user-typing', {
      ticketId,
      userName: user.displayName || user.userName,
    })
  }

  const getCommentsByTicketId = useCallback(
    (ticketId) => comments.filter((c) => c.ticketId === ticketId),
    [comments]
  )

  const contextValue = useMemo(
    () => ({
      comments,
      isLoading,
      error,
      highlightedIds,
      typingUsers,
      emitTyping,
      fetchComments,
      addComment,
      editComment,
      deleteComment,
      getCommentsByTicketId,
      setComments,
    }),
    [
      comments,
      isLoading,
      error,
      highlightedIds,
      typingUsers,
      emitTyping,
      fetchComments,
      addComment,
      editComment,
      deleteComment,
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
