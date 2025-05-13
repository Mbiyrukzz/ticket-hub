import React, { useState } from 'react'

const CommentThread = ({ comment, onReply, currentUser }) => {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText, comment.id)
      setReplyText('')
      setShowReply(false)
    }
  }

  return (
    <div className="ml-4 mt-4 border-l border-gray-300 pl-4">
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
        <p className="text-gray-800">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          By {comment.userId} · {new Date(comment.createdAt).toLocaleString()}
        </p>
        <button
          onClick={() => setShowReply((prev) => !prev)}
          className="text-sm text-blue-500 mt-1 hover:underline"
        >
          Reply
        </button>

        {showReply && (
          <div className="mt-2">
            <textarea
              className="w-full border p-1 text-sm"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a reply..."
            />
            <button
              onClick={handleReply}
              className="mt-1 px-3 py-1 bg-blue-500 text-white text-sm rounded"
            >
              Post
            </button>
          </div>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <CommentThread
          key={reply.id}
          comment={reply}
          onReply={onReply}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}

export default CommentThread
