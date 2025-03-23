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
      <h4 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">
        Comments ({comments.length})
      </h4>

      {/* Comment Input */}
      <div className="mt-4 flex items-center space-x-3 bg-white p-3 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 p-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition"
        >
          Comment
        </button>
      </div>

      {/* Comment List */}
      <div className="mt-4 space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id} className="relative flex space-x-3">
              {/* Avatar */}
              <div className="relative z-10 min-w-[40px] w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
                {comment.user[0]}
              </div>

              {/* Thread Line */}
              {index !== 0 && (
                <div className="absolute left-5 top-3 h-full w-0.5 bg-gray-300"></div>
              )}

              {/* Comment Content */}
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
                  </div>
                ) : (
                  <>
                    {/* Prevent Long Comments from Overflowing */}
                    <p className="text-gray-700 break-words overflow-hidden">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <FontAwesomeIcon icon={faThumbsUp} /> <span>Like</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-500">
                        <FontAwesomeIcon icon={faReply} /> <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleEdit(comment.id, comment.text)}
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
