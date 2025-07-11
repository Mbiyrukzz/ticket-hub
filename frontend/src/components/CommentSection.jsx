import React, { useState, useContext, useEffect } from 'react'
import CommentContext from '../contexts/CommentContext'
import ConfirmDeleteResponse from './ConfirmDeleteResponse'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faThumbsUp,
  faReply,
  faEllipsisH,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import { useUser } from '../hooks/useUser'
import ActivityContext from '../contexts/ActivityContext'
import clsx from 'clsx'

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

const CommentSection = ({ ticketId }) => {
  const {
    getCommentsByTicketId,
    addComment,
    editComment,
    deleteComment,
    fetchComments,
    highlightedIds,
    typingUsers,
    emitTyping,
  } = useContext(CommentContext)

  const { refreshActivities } = useContext(ActivityContext)
  const { user } = useUser()

  const comments = getCommentsByTicketId(ticketId) || []

  const [newComment, setNewComment] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [error, setError] = useState(null)
  const [replying, setReplying] = useState({})
  const [replyText, setReplyText] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editedText, setEditedText] = useState('')

  useEffect(() => {
    if (user?.uid && ticketId) {
      fetchComments(user.uid, ticketId).catch((err) =>
        setError(
          err.message.includes('Unauthorized')
            ? 'You do not have permission to view comments for this ticket.'
            : `Error fetching comments: ${err.message}`
        )
      )
    }
  }, [user, ticketId, fetchComments])

  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault()
    if (!user?.uid) return setError('You must be logged in to comment.')

    const content = parentId ? replyText[parentId] : newComment
    if (!content.trim()) return

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
      setError('Failed to add comment: ' + error.message)
    }
  }

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0])
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteComment(user.uid, ticketId, commentToDelete)
      await refreshActivities()
      setCommentToDelete(null)
    } catch (error) {
      setError('Failed to delete comment: ' + error.message)
    }
  }

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
    <div className="mt-8 max-w-3xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-lg p-6 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400">
          Comments{' '}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        </h2>
        {typingUsers.length > 0 && (
          <p className="text-sm text-teal-500 dark:text-teal-400 mt-2 animate-pulse">
            {typingUsers.join(', ')} typing...
          </p>
        )}
      </div>

      {error && (
        <p className="text-coral-500 dark:text-coral-400 text-sm mb-4 bg-coral-100 dark:bg-coral-900/20 p-3 rounded-lg">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => handleAddComment(e)}
        className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      >
        <textarea
          rows={4}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value)
            emitTyping()
          }}
          className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none resize-none transition-all duration-200 hover:shadow-md"
        />
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Attach Image
          </label>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-sm font-medium py-2 px-5 rounded-full transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Post Comment
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-6">
        {nestedComments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          nestedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
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
              setEditingId={setEditingId} // Pass setEditingId as a prop
              highlighted={highlightedIds.includes(comment.id)}
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
  user,
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
  setEditingId, // Add setEditingId to props
  highlighted,
}) => {
  const isAuthor = comment.userId === user?.uid

  return (
    <div
      className={clsx(
        'pl-5 border-l-4 rounded-lg transition-all duration-300 hover:shadow-md',
        highlighted &&
          'bg-amber-100 dark:bg-blue-500/20 border-amber-400 dark:border-amber-300',
        isAuthor
          ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-400 dark:border-blue-500'
          : 'border-gray-300 dark:border-gray-600'
      )}
    >
      <div className="flex items-start gap-4 py-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {comment.userName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {comment.userName}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <FontAwesomeIcon
              icon={faEllipsisH}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition"
            />
          </div>

          {editingId === comment.id ? (
            <div className="space-y-3">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none resize-none transition-all duration-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onSaveEdit(comment.id)}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-4 py-2 rounded-full text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedText('')
                    setEditingId(null)
                  }}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                {comment.content}
              </p>
              {comment.imageUrl && (
                <img
                  src={comment.imageUrl}
                  alt="Comment Attachment"
                  className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 max-w-sm shadow-sm hover:shadow-md transition-all duration-200"
                />
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <button className="flex items-center gap-1 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-200">
                  <FontAwesomeIcon icon={faThumbsUp} />
                  Like
                </button>
                <button
                  onClick={() =>
                    setReplying((prev) => ({
                      ...prev,
                      [comment.id]: !prev[comment.id],
                    }))
                  }
                  className="flex items-center gap-1 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faReply} />
                  Reply
                </button>
                {isAuthor && (
                  <>
                    <button
                      onClick={() => onEdit(comment.id, comment.content)}
                      className="hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={onDelete}
                      className="text-coral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {replying[comment.id] && (
            <form
              onSubmit={(e) => onReply(e, comment.id)}
              className="mt-4 space-y-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
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
                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none resize-none transition-all duration-200"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                Post Reply
              </button>
            </form>
          )}

          {comment.children?.length > 0 && (
            <div className="mt-6 space-y-6">
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  user={user}
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
                  setEditingId={setEditingId}
                  highlighted={highlighted}
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
