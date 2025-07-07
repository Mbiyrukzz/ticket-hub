const { isAdmin } = require('../middleware/isAdmin')
const { verifyAuthToken } = require('../middleware/verifyAuthToken')

const adminEditUserProfileRoute = {
  path: '/users/:userId',
  method: 'put',
  middleware: [verifyAuthToken, isAdmin],
  handler: async (req, res) => {
    try {
    } catch (error) {}
  },
}
