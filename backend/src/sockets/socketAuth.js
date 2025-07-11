// middlewares/socketAuth.js
const admin = require('firebase-admin')

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Authentication token missing'))
    }

    const decoded = await admin.auth().verifyIdToken(token)
    socket.user = decoded // attach user to socket
    next()
  } catch (err) {
    console.error('❌ Socket authentication failed:', err.message)
    next(new Error('Authentication failed'))
  }
}

module.exports = { socketAuth }
