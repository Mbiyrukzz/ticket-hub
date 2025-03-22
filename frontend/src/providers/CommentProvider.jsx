import { useState, useEffect } from 'react'
import CommentContext from '../contexts/CommentContext'

const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('comments')
    return savedComments ? JSON.parse(savedComments) : []
  })

  // ✅ Use useEffect to sync comments to localStorage
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments))
  }, [comments])

  // ✅ Create a new comment
  const addComment = (ticketId, text, user) => {
    const newComment = {
      id: Date.now(),
      ticketId,
      text,
      user,
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [...prev, newComment])
  }

  // ✅ Edit an existing comment
  const editComment = (commentId, newText) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, text: newText } : comment
      )
    )
  }

  // ✅ Delete a comment
  const deleteComment = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
  }

  // ✅ Get all comments for a ticket
  const getCommentsByTicketId = (ticketId) => {
    return comments.filter((comment) => comment.ticketId === ticketId)
  }

  return (
    <CommentContext.Provider
      value={{
        comments,
        addComment,
        editComment,
        deleteComment,
        getCommentsByTicketId,
      }}
    >
      {children}
    </CommentContext.Provider>
  )
}

export default CommentProvider
