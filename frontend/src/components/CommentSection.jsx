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
  const [editingId, setEditingId] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!propComments && user?.uid && ticketId) {
      fetchComments(user.uid, ticketId)
    }
  }, [user, ticketId, fetchComments, propComments])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user?.uid) {
      setError('You must be logged in to comment.')
      return
    }
    if (newComment.trim()) {
      try {
        await addComment(user.uid, ticketId, newComment, newImage)

        await refreshActivities()

        setNewComment('')
        setNewImage(null)
        setError(null)
      } catch (error) {
        setError('Failed to add comment.' + error)
      }
    }
  }

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0])
  }

  const handleEdit = (commentId, text) => {
    setEditingId(commentId)
    setEditedText(text)
    setError(null)
  }

  const handleSaveEdit = async (commentId) => {
    if (!user?.uid) {
      setError('You must be logged in to edit a comment.')
      return
    }
    if (editedText.trim()) {
      try {
        await editComment(user.uid, ticketId, commentId, {
          content: editedText,
        })
        setEditingId(null)
        setEditedText('')
        setError(null)
      } catch (error) {
        setError(`Failed to edit comment: ${error.message}`)
      }
    }
  }

  const handleDeleteClick = (commentId) => {
    setCommentToDelete(commentId)
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

  return (
    <div className="mt-8 max-w-3xl mx-auto bg-white rounded-xl p-4">
      <h4 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
        Comments ({comments.length})
      </h4>

      {error && (
        <p className="text-red-500 mt-3 bg-red-50 p-2 rounded-md">{error}</p>
      )}

      <form
        onSubmit={handleAddComment}
        className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200"
      >
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <div className="flex items-center justify-between">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              Add Comment
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4 space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id || index}
              className={`flex space-x-3 p-3 rounded-lg ${
                comment.userId === user?.uid ? 'bg-indigo-50' : 'bg-white'
              }`}
            >
              <div className="min-w-[40px] w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                {comment.author?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 font-medium">{comment.author}</p>
                  <FontAwesomeIcon
                    icon={faEllipsisH}
                    className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </div>
                {editingId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 mt-1 break-words">
                      {comment.content}
                    </p>
                    {comment.imageUrl && (
                      <img
                        src={comment.imageUrl}
                        alt="Comment attachment"
                        className="mt-2 max-w-xs rounded-md border border-gray-200"
                      />
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors">
                        <FontAwesomeIcon icon={faThumbsUp} /> <span>Like</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors">
                        <FontAwesomeIcon icon={faReply} /> <span>Reply</span>
                      </button>
                      {/* Temporarily removing the user check to ensure buttons are visible */}
                      <button
                        onClick={() => handleEdit(comment.id, comment.content)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(comment.id)}
                        className="text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
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

export default CommentSection
