import React, { useContext, useState } from 'react'
import CommentContext from '../contexts/CommentContext'
import ConfirmDeleteResponse from './ConfirmDeleteResponse'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faThumbsUp,
  faReply,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons'

const CommentSection = ({ ticketId }) => {
  const { getCommentsByTicketId, addComment, editComment, deleteComment } =
    useContext(CommentContext)
  const comments = getCommentsByTicketId(ticketId) || []

  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [commentToDelete, setCommentToDelete] = useState(null)

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(ticketId, newComment, 'User') // Replace 'User' with actual user
      setNewComment('')
    }
  }

  const handleEdit = (commentId, text) => {
    setEditingId(commentId)
    setEditedText(text)
  }

  const handleSaveEdit = (commentId) => {
    if (editedText.trim()) {
      editComment(commentId, editedText)
      setEditingId(null)
      setEditedText('')
    }
  }

  const handleDeleteClick = (commentId) => {
    setCommentToDelete(commentId)
  }

  const handleConfirmDelete = () => {
    deleteComment(commentToDelete)
    setCommentToDelete(null)
  }

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <h4 className="text-xl font-semibold text-yellow-400 border-b border-gray-700 pb-2">
        Comments ({comments.length})
      </h4>

      {/* Comment Input */}
      <div className="mt-4 flex items-center space-x-3 bg-gray-800 p-3 rounded-lg">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 p-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition"
        >
          Comment
        </button>
      </div>

      {/* Comment List */}
      <div className="mt-4 space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center">No comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id} className="relative flex space-x-3">
              {/* Avatar */}
              <div className="relative z-10 min-w-[40px] w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400 text-gray-900 font-bold text-sm">
                {comment.user[0]}
              </div>

              {/* Thread Line - Moves down to avoid avatar */}
              {index !== 0 && (
                <div className="absolute left-5 top-3 h-full w-0.5 bg-gray-600"></div>
              )}

              {/* Comment Content */}
              <div className="bg-gray-800 p-4 rounded-lg w-full border border-gray-700 pl-4">
                {editingId === comment.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="flex-1 p-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="px-3 py-1 bg-green-500 text-white font-medium rounded-md hover:bg-green-400 transition"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Prevent Long Comments from Overflowing */}
                    <p className="text-gray-300 break-words overflow-hidden">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-gray-400 text-sm">
                      <button className="flex items-center space-x-1 hover:text-yellow-400">
                        <FontAwesomeIcon icon={faThumbsUp} /> <span>Like</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-yellow-400">
                        <FontAwesomeIcon icon={faReply} /> <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleEdit(comment.id, comment.text)}
                        className="text-blue-400 hover:text-blue-300"
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
                        className="ml-auto cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {commentToDelete !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <ConfirmDeleteResponse
            onConfirm={handleConfirmDelete}
            onDeny={() => setCommentToDelete(null)}
          />
        </div>
      )}
    </div>
  )
}

export default CommentSection
