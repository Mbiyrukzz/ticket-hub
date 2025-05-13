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
    <div className="mt-8 max-w-3xl mx-auto rounded-2xl bg-white shadow-xl p-6 space-y-6">
      <h4 className="text-xl font-semibold text-gray-900">
        Comments ({comments.length})
      </h4>

      {error && (
        <p className="text-red-500 bg-red-50 p-2 rounded-md">{error}</p>
      )}

      <form
        onSubmit={(e) => handleAddComment(e)}
        className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3"
      >
        <input
          type="text"
          placeholder="Share your mind..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Post
          </button>
        </div>
      </form>

      {/* Render comments recursively */}
      <div className="space-y-6">
        {nestedComments.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
            No comments yet. Be the first to comment!
          </p>
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
    <div className="ml-0 md:ml-6 border-l-2 border-gray-200 pl-4">
      <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm mt-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold">
          {comment.author?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-900">{comment.author}</p>
            <FontAwesomeIcon
              icon={faEllipsisH}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            />
          </div>

          {editingId === comment.id ? (
            <>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSaveEdit(comment.id)}
                  className="px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditedText('')}
                  className="px-4 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700">{comment.content}</p>
              {comment.imageUrl && (
                <img
                  src={comment.imageUrl}
                  alt="Comment"
                  className="mt-2 max-w-xs rounded-md border border-gray-200"
                />
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <button className="flex items-center gap-1 hover:text-indigo-600 transition">
                  <FontAwesomeIcon icon={faThumbsUp} /> Like
                </button>
                <button
                  onClick={() =>
                    setReplying((prev) => ({
                      ...prev,
                      [comment.id]: !prev[comment.id],
                    }))
                  }
                  className="flex items-center gap-1 hover:text-indigo-600 transition"
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
                  className="text-red-600 hover:text-red-700 font-medium"
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
                className="px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Post Reply
              </button>
            </form>
          )}
        </div>
      </div>

      {comment.children?.length > 0 && (
        <div className="space-y-4 mt-2">
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
  )
}

export default CommentSection
