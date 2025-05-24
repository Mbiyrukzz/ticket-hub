import React, { useState, useEffect } from 'react'
import ActivityContext from '../contexts/ActivityContext'
import useAuthedRequest from '../hooks/useAuthedRequest'
import { useUser } from '../hooks/useUser'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ActivityProviders = ({ children }) => {
  const { get, del } = useAuthedRequest()
  const { user } = useUser()
  const [activities, setActivities] = useState([])

  const fetchActivities = async () => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping fetchActivities')
      setActivities([])
      return
    }

    try {
      console.log('🔍 Fetching activities from backend')
      const response = await get(`${API_URL}/activities`)
      setActivities(response)
      console.log('✅ Activities fetched successfully:', response)
    } catch (error) {
      console.error('❌ Error fetching activities:', {
        message: error.message,
        response: error.response?.data,
      })
      setActivities([])
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [get, user])

  const clearActivities = async () => {
    try {
      console.log('🔍 Clearing activities for user:', user.uid)
      await del('/activities')
      setActivities([])
      console.log('✅ Activities cleared successfully')
    } catch (error) {
      console.error('❌ Error clearing activities:', error)
      throw error
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now - activityTime) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return 'Yesterday'
  }

  const refreshActivities = async () => {
    await fetchActivities()
  }

  return (
    <ActivityContext.Provider
      value={{ activities, formatTime, refreshActivities, clearActivities }}
    >
      {children}
    </ActivityContext.Provider>
  )
}

export default ActivityProviders
