import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faCommentDots,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons'
import { useUser } from '../hooks/useUser'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Loading from './Loading'

const SharedTicketList = ({ sharedTickets = [] }) => {
  const { isLoading, user } = useUser()
  const [loading, setLoading] = useState('')

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading || isLoading) return <Loading />
  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
      {sharedTickets.length === 0 ? (
        <p className="text-gray-400 text-center text-lg font-medium">
          No shared tickets found.
        </p>
      ) : (
        sharedTickets.map((ticket) => (
          <Link
            to={`/shared/${ticket.id}`}
            key={ticket.id}
            className="block bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {ticket.title}
                </h3>
                <p className="text-gray-600 text-sm leading-snug">
                  {ticket.content?.slice(0, 100)}
                  {ticket.content?.length > 100 && '...'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm pt-1">
                  <span className="text-gray-500 flex items-center gap-1">
                    <FontAwesomeIcon icon={faHashtag} />
                    {ticket.id}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCommentDots} />
                    {ticket.comments?.length || 0}
                  </span>
                  <span className="text-indigo-600 flex items-center gap-1 font-medium">
                    <FontAwesomeIcon icon={faUser} />
                    Shared by {user.email || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}

export default SharedTicketList
