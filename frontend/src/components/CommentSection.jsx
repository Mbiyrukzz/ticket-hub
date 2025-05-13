import React, { useState, useContext, useEffect } from 'react'
import CommentContext from '../contexts/CommentContext'
import ConfirmDeleteResponse from './ConfirmDeleteResponse'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faThumbsUp,
  faReply,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons'
import { useUser } from '../hooks/useUser'
import ActivityContext from '../contexts/ActivityContext'

const buildCommentTree = (comments) => {
  const map = {}
  const roots = []

  comments.forEach((comment) => {
    comment.children = []
    map[comment.id] = comment
  })

  comments.forEach((comment) => {
    if (comment.parentId) {
      const parent = map[comment.parentId]
      if (parent) parent.children.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return roots
}

const CommentSection = ({ ticketId, comments: propComments }) => {
  const {
    getCommentsByTicketId,
    addComment,
    editComment,
    deleteComment,
    fetchComments,
  } = useContext(CommentContext)

  const { refreshActivities } = useContext(ActivityContext)
  const { user } = useUser()

  const comments = propComments || getCommentsByTicketId(ticketId) || []

  const [newComment, setNewComment] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!propComments && user?.uid && ticketId) {
      fetchComments(user.uid, ticketId).catch((err) =>
        setError(
          err.message.includes('Unauthorized')
            ? 'You do not have permission to view comments for this ticket.'
            : `Error fetching comments: ${err.message}`
        )
      )
    }
  }, [user, ticketId, fetchComments, propComments])

  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault()
    if (!user?.uid) {
      setError('You must be logged in to comment.')
      return
    }

    const content = parentId ? replyText[parentId] : newComment

    if (content.trim()) {
      try {
        await addComment(user.uid, ticketId, content, newImage, parentId)
        await refreshActivities()

        if (parentId) {
          setReplyText((prev) => ({ ...prev, [parentId]: '' }))
          setReplying((prev) => ({ ...prev, [parentId]: false }))
        } else {
          setNewComment('')
          setNewImage(null)
        }

        setError(null)
      } catch (error) {
        setError('Failed to add comment.' + error)
      }
    }
  }

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0])
  }

  const handleConfirmDelete = async () => {
    if (!user?.uid) {
      setError('You must be logged in to delete a comment.')
      return
    }
    try {
      await deleteComment(user.uid, ticketId, commentToDelete)
      await refreshActivities()
      setCommentToDelete(null)
      setError(null)
    } catch (error) {
      setError('Failed to delete comment.' + error)
    }
  }

  const [replying, setReplying] = useState({})
  const [replyText, setReplyText] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editedText, setEditedText] = useState('')

  const handleEdit = (id, content) => {
    setEditingId(id)
    setEditedText(content)
  }

  const handleSaveEdit = async (id) => {
    try {
      await editComment(user.uid, ticketId, id, { content: editedText })
      setEditingId(null)
      setEditedText('')
    } catch (error) {
      setError(`Failed to edit comment: ${error.message}`)
    }
  }

  const nestedComments = buildCommentTree(comments)

  return (
    <div className="mt-8 max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Comments{' '}
          <span className="ml-2 text-sm text-gray-500">
            ({comments.length})
          </span>
        </h2>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form
        onSubmit={(e) => handleAddComment(e)}
        className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50"
      >
        <textarea
          rows={3}
          placeholder="Add comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex justify-between items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-gray-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-6">
        {nestedComments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet.</p>
        ) : (
          nestedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replying={replying}
              setReplying={setReplying}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={handleAddComment}
              onDelete={() => setCommentToDelete(comment.id)}
              onEdit={handleEdit}
              onSaveEdit={handleSaveEdit}
              editingId={editingId}
              editedText={editedText}
              setEditedText={setEditedText}
            />
          ))
        )}
      </div>

      {commentToDelete !== null && (
        <ConfirmDeleteResponse
          onConfirm={handleConfirmDelete}
          onDeny={() => setCommentToDelete(null)}
        />
      )}
    </div>
  )
}

const CommentItem = ({
  comment,
  replying,
  setReplying,
  replyText,
  setReplyText,
  onReply,
  onDelete,
  onEdit,
  onSaveEdit,
  editingId,
  editedText,
  setEditedText,
}) => {
  return (
    <div className="pl-4 border-l border-gray-200">
      <div className="flex items-start space-x-4">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
          {comment.userName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-900">{comment.userName}</p>
            <FontAwesomeIcon icon={faEllipsisH} className="text-gray-400" />
          </div>

          {editingId === comment.id ? (
            <>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSaveEdit(comment.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditedText('')}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mt-1">{comment.content}</p>
              {comment.imageUrl && (
                <img
                  src={comment.imageUrl}
                  alt="Comment Attachment"
                  className="mt-2 max-w-xs rounded-md border"
                />
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-indigo-600">
                  <FontAwesomeIcon icon={faThumbsUp} /> Like
                </button>
                <button
                  onClick={() =>
                    setReplying((prev) => ({
                      ...prev,
                      [comment.id]: !prev[comment.id],
                    }))
                  }
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  <FontAwesomeIcon icon={faReply} /> Reply
                </button>
                <button
                  onClick={() => onEdit(comment.id, comment.content)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-500 font-medium"
                >
                  Delete
                </button>
              </div>
            </>
          )}

          {replying[comment.id] && (
            <form
              onSubmit={(e) => onReply(e, comment.id)}
              className="mt-3 space-y-2"
            >
              <textarea
                value={replyText[comment.id] || ''}
                onChange={(e) =>
                  setReplyText((prev) => ({
                    ...prev,
                    [comment.id]: e.target.value,
                  }))
                }
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
              >
                Post Reply
              </button>
            </form>
          )}

          {comment.children?.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  replying={replying}
                  setReplying={setReplying}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReply={onReply}
                  onDelete={() => onDelete(child.id)}
                  onEdit={onEdit}
                  onSaveEdit={onSaveEdit}
                  editingId={editingId}
                  editedText={editedText}
                  setEditedText={setEditedText}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentSection
