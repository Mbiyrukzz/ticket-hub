const { typingStatusCollection } = require('../db')
const getTypingUsersRoute = {
  path: '/tickets/:ticketId/typing-users',
  method: 'get',
  handler: async (req, res) => {
    const { ticketId } = req.params
    const typingStatus = typingStatusCollection()

    const users = await typingStatus
      .find({ ticketId, isTyping: true })
      .project({ userId: 1, userName: 1, updatedAt: 1 })
      .toArray()

    return res.json({ typingUsers: users })
  },
}
module.exports = { getTypingUsersRoute }
