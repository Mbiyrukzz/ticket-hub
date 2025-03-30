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

const CommentSection = ({ ticketId, comments: propComments }) => {
  const {
    getCommentsByTicketId,
    addComment,
    editComment,
    deleteComment,
    fetchComments,
  } = useContext(CommentContext)
  const { user } = useUser()

  // Use propComments if provided, otherwise fall back to CommentContext
  const comments = propComments || getCommentsByTicketId(ticketId) || []

  const [newComment, setNewComment] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [error, setError] = useState(null)

  // Optional: Fetch comments if propComments isn’t provided
  useEffect(() => {
    if (!propComments && user?.uid && ticketId) {
      console.log('Fetching comments with:', { userId: user.uid, ticketId })
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
        setNewComment('')
        setNewImage(null)
        setError(null)
      } catch (error) {
        console.error('Failed to add comment:', error.message)
        setError('Failed to add comment.')
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
        console.log('Editing comment:', {
          userId: user.uid,
          ticketId,
          commentId,
          text: editedText,
        })
        await editComment(user.uid, ticketId, commentId, {
          content: editedText,
        })
        setEditingId(null)
        setEditedText('')
        setError(null)
      } catch (error) {
        console.error('Failed to edit comment:', error.message)
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
      console.log('Deleting comment:', {
        userId: user.uid,
        ticketId,
        commentId: commentToDelete,
      })
      await deleteComment(user.uid, ticketId, commentToDelete)
      setCommentToDelete(null)
      setError(null)
    } catch (error) {
      console.error('Failed to delete comment:', error.message)
      setError('Failed to delete comment.')
    }
  }

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <h4 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">
        Comments ({comments.length})
      </h4>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <form
        onSubmit={handleAddComment}
        className="mt-4 bg-white p-3 rounded-lg shadow-md"
      >
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition"
          >
            Comment
          </button>
        </div>
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {newImage && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {newImage.name}
            </p>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id} className="relative flex space-x-3">
              <div className="relative z-10 min-w-[40px] w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
                {comment.author[0]}
              </div>
              {index !== 0 && (
                <div className="absolute left-5 top-3 h-full w-0.5 bg-gray-300"></div>
              )}
              <div className="bg-white p-4 rounded-lg w-full border border-gray-300 shadow-sm">
                {editingId === comment.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="flex-1 p-2 bg-gray-100 text-gray-800 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="px-3 py-1 bg-green-500 text-white font-medium rounded-md hover:bg-green-400 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 break-words overflow-hidden">
                      {comment.content}
                    </p>
                    {comment.imageUrl && (
                      <img
                        src={comment.imageUrl}
                        alt="Comment attachment"
                        className="mt-2 max-w-xs rounded-md"
                      />
                    )}
                    <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <FontAwesomeIcon icon={faThumbsUp} /> <span>Like</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <FontAwesomeIcon icon={faReply} /> <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleEdit(comment.id, comment.content)}
                        className="text-green-500 hover:text-green-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(comment.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                      <FontAwesomeIcon
                        icon={faEllipsisH}
                        className="ml-auto cursor-pointer text-gray-400"
                      />
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
