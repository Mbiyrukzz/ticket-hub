import { commentsCollection } from '../db.js'
import { ObjectId } from 'mongodb'

export const deleteCommentRoute = {
  path: '/comments/:id',
  method: 'delete',
  handler: async (req, res) => {
    try {
      const { id } = req.params
      console.log('🧐 Deleting comment with ID:', id)

      if (!ObjectId.isValid(id)) {
        console.log('⚠️ Invalid ID:', id)
        return res.status(400).json({ error: 'Invalid comment ID' })
      }

      const objectId = new ObjectId(id)
      const comment = await commentsCollection.findOne({ _id: objectId })
      if (!comment) {
        console.log('⚠️ Comment not found for _id:', objectId)
        return res.status(404).json({ error: 'Comment not found' })
      }

      await commentsCollection.deleteOne({ _id: objectId })
      console.log('✅ Deleted comment with _id:', objectId)
      res.json({ message: 'Comment deleted successfully', id })
    } catch (error) {
      console.error('❌ Error deleting comment:', error.message, error.stack)
      res
        .status(500)
        .json({ error: 'Failed to delete comment', details: error.message })
    }
  },
}
