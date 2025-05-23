const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const transformComment = (comment) => ({
  id: comment.id,
  text: comment.content,
  sender: {
    id: comment.createdBy,
    name: comment.author,
  },
  parentId: comment.parentCommentId,
  attachment: comment.attachment ? `${API_URL}/${comment.attachment}` : null,
  createdAt: comment.createdAt,
  replies: comment.replies || [],
})

export const validateParentCommentId = (parentCommentId, comments) => {
  if (!parentCommentId) return { isValid: true }
  const exists = comments.some((comment) => comment.id === parentCommentId)
  return exists
    ? { isValid: true }
    : { isValid: false, error: 'Parent comment not found' }
}
