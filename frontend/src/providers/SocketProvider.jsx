import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { getAuth, getIdToken } from 'firebase/auth'

import SocketContext from '../contexts/SocketContext'
import { useUser } from '../hooks/useUser'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8090'

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (!user?.uid) return

    const connectSocket = async () => {
      try {
        const token = await getIdToken(getAuth().currentUser) // ✅ fixed here

        socketRef.current = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
        })

        socketRef.current.on('connect', () => {
          console.log('✅ Socket connected:', socketRef.current.id)
          setIsConnected(true)
        })

        socketRef.current.on('disconnect', () => {
          console.log('🔌 Socket disconnected')
          setIsConnected(false)
        })

        socketRef.current.on('connect_error', (err) => {
          console.error('❌ Socket connection error:', err.message)
        })
      } catch (err) {
        console.error('❌ Failed to get Firebase token:', err)
      }
    }

    connectSocket()

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
