import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from 'react'
import CommentContext from '../contexts/CommentContext'
import SocketContext from '../contexts/SocketContext'
import useAuthedRequest from '../hooks/useAuthedRequest'
import { useUser } from '../hooks/useUser'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

const CommentProvider = ({ children, ticketId }) => {
  const { get, post, put, del, isReady } = useAuthedRequest()
  const { user } = useUser()
  const { socket, isConnected } = useContext(SocketContext)

  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [highlightedIds, setHighlightedIds] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  const listenersSetRef = useRef(false)

  // ✅ Socket Room Join + Listeners
  useEffect(() => {
    if (!socket || !ticketId || !user?.uid || !isConnected) return

    socket.emit('join-ticket-room', ticketId)
    console.log(`🟢 Joined ticket room: ${ticketId}`)

    if (!listenersSetRef.current) {
      listenersSetRef.current = true

      socket.on('comment-created', (comment) => {
        setComments((prev) => {
          const exists = prev.some((c) => c.id === comment.id)
          return exists ? prev : [...prev, comment]
        })
        setHighlightedIds((prev) => [...prev, comment.id])
        setTimeout(() => {
          setHighlightedIds((prev) => prev.filter((id) => id !== comment.id))
        }, 3000)
      })

      socket.on('comment-updated', (updated) => {
        setComments((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
      })

      socket.on('comment-deleted', (commentId) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      })

      socket.on('users-typing', (users) => {
        const currentName = user?.displayName || user?.userName
        setTypingUsers(users.filter((u) => u !== currentName))
      })
    }

    return () => {
      socket.emit('leave-ticket-room', ticketId)
      console.log(`👋 Left ticket room: ${ticketId}`)
    }
  }, [socket, ticketId, user?.uid, isConnected])

  // 📥 Load Comments
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

  // ➕ Add Comment
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
        socket?.emit('new-comment', { ticketId, comment })
        return comment
      } catch (err) {
        console.error('❌ Failed to add comment:', err)
        setError('Failed to add comment.')
        throw err
      }
    },
    [post, isReady, socket]
  )

  // ✏️ Edit Comment
  const editComment = useCallback(
    async (userId, ticketId, commentId, updatedData) => {
      if (!updatedData?.content?.trim()) return
      try {
        const res = await put(
          `${API_URL}/api/tickets/${ticketId}/comments/${commentId}`,
          updatedData
        )
        const updated = res?.updatedComment
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updated : c))
        )
        socket?.emit('update-comment', { ticketId, comment: updated })
        return updated
      } catch (err) {
        console.error('❌ Failed to edit comment:', err)
        setError('Failed to edit comment.')
        throw err
      }
    },
    [put, socket]
  )

  // ❌ Delete Comment
  const deleteComment = useCallback(
    async (userId, ticketId, commentId) => {
      try {
        await del(`${API_URL}/tickets/${ticketId}/comments/${commentId}`)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        socket?.emit('delete-comment', { ticketId, commentId })
      } catch (err) {
        console.error('❌ Failed to delete comment:', err)
        setError('Failed to delete comment.')
        throw err
      }
    },
    [del, socket]
  )

  // 💬 Typing
  const emitTyping = useCallback(
    (ticketId) => {
      if (!user?.displayName || !ticketId) return
      socket?.emit('user-typing', {
        ticketId,
        userName: user.displayName || user.userName,
      })
    },
    [socket, user]
  )

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
