import React, { useState, useEffect } from 'react'
import ActivityContext from '../contexts/ActivityContext'
import useAuthedRequest from '../hooks/useAuthedRequest'
import { useUser } from '../hooks/useUser'

const ActivityProviders = ({ children }) => {
  const { get } = useAuthedRequest() // Call the hook as a function
  const { user } = useUser()
  const [activities, setActivities] = useState([])

  // Fetch activities from the backend
  const fetchActivities = async () => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping fetchActivities')
      setActivities([]) // Clear activities if user is not authenticated
      return
    }

    try {
      console.log('🔍 Fetching activities from backend')
      const response = await get('http://localhost:8080/activities')
      setActivities(response)
      console.log('✅ Activities fetched successfully:', response)
    } catch (error) {
      console.error('❌ Error fetching activities:', {
        message: error.message,
        response: error.response?.data,
      })
      setActivities([]) // Clear activities on error
    }
  }

  // Fetch activities on mount and when user changes
  useEffect(() => {
    fetchActivities()
  }, [get, user]) // Add user as a dependency

  // Format the time for display (e.g., "5 mins ago")
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

  // Provide a refresh function to allow components to trigger a fetch
  const refreshActivities = async () => {
    await fetchActivities()
  }

  return (
    <ActivityContext.Provider
      value={{ activities, formatTime, refreshActivities }}
    >
      {children}
    </ActivityContext.Provider>
  )
}

export default ActivityProviders
