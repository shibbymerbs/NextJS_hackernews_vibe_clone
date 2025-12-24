'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { auth } from '@/auth'

interface CommentVoteButtonsProps {
  commentId: string
  initialPoints: number
  className?: string
}

export default function CommentVoteButtons({ commentId, initialPoints, className = '' }: CommentVoteButtonsProps) {
  const { data: session, status } = useSession()
  const [points, setPoints] = useState(initialPoints)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get user ID from session or use demo user for testing
  const effectiveUserId = session?.user?.id || 'demo-user-123'

  useEffect(() => {
    const fetchUserVote = async (effectiveUserId: string) => {
      try {
        const response = await fetch(`/api/votes?commentId=${commentId}&userId=${effectiveUserId}`)
        const data = await response.json()
        if (data.vote) {
          setUserVote(data.vote)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user vote:', error)
        setIsLoading(false)
      }
    }

    fetchUserVote(effectiveUserId)
  }, [commentId, effectiveUserId, session?.user?.id])

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          action: voteType,
          userId: effectiveUserId
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update UI based on the action
        if (result.action === 'added') {
          if (voteType === 'upvote') {
            setPoints(points + 1)
            setUserVote('upvote')
          } else {
            setPoints(points - 1)
            setUserVote('downvote')
          }
        } else if (result.action === 'removed') {
          if (voteType === 'upvote') {
            setPoints(points - 1)
            setUserVote(null)
          } else {
            setPoints(points + 1)
            setUserVote(null)
          }
        } else if (result.action === 'changed') {
          if (result.newVoteType === 'upvote') {
            setPoints(points + 2)
            setUserVote('upvote')
          } else {
            setPoints(points - 2)
            setUserVote('downvote')
          }
        }
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  // Disable voting if not logged in
  const isLoggedIn = !!session?.user?.id

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-hn-dark-gray text-sm">{points} points</span>
        <div className="flex flex-col space-y-1">
          <button className="vote-button disabled" disabled>▲</button>
          <button className="vote-button disabled" disabled>▼</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-hn-dark-gray text-sm">{points} points</span>
      <div className="flex flex-col space-y-1">
        {!isLoggedIn ? (
          <button className="vote-button disabled" disabled title="Please login to vote">
            ▲
          </button>
        ) : (
          <button
            onClick={() => handleVote('upvote')}
            className={`vote-button ${userVote === 'upvote' ? 'active' : ''}`}
            disabled={!isLoggedIn}
          >
            ▲
          </button>
        )}
        {!isLoggedIn ? (
          <button className="vote-button disabled" disabled title="Please login to vote">
            ▼
          </button>
        ) : (
          <button
            onClick={() => handleVote('downvote')}
            className={`vote-button ${userVote === 'downvote' ? 'active' : ''}`}
            disabled={!isLoggedIn}
          >
            ▼
          </button>
        )}
      </div>
    </div>
  )
}