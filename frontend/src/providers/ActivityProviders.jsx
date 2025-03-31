import React, { useState, useCallback } from 'react'
import ActivityContext from '../contexts/ActivityContext'

const ActivityProviders = ({ children }) => {
  const [activities, setActivities] = useState([])

  const addActivity = useCallback((type, message) => {
    const newActivity = {
      id: Date.now(), // Use timestamp as a unique ID
      type,
      message,
      time: new Date().toISOString(), // Store the exact timestamp
    }
    setActivities((prev) => [newActivity, ...prev].slice(0, 10)) // Keep only the latest 10 activities
  }, [])

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

  return (
    <ActivityContext.Provider value={{ activities, addActivity, formatTime }}>
      {children}
    </ActivityContext.Provider>
  )
}

export default ActivityProviders
