'use client'

import { useState, useEffect } from 'react'

interface CommentVoteButtonsProps {
  commentId: string
  initialPoints: number
  className?: string
  userId?: string | null
}

export default function CommentVoteButtons({ commentId, initialPoints, className = '', userId = null }: CommentVoteButtonsProps) {
  const [points, setPoints] = useState(initialPoints)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use demo user for testing if no userId is provided
    const effectiveUserId = userId || 'demo-user-123'
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
  }, [commentId, userId])

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    // Use a default user ID for testing purposes
    const effectiveUserId = userId || 'demo-user-123'

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
        <button
          className={`vote-button ${userVote === 'upvote' ? 'active' : ''}`}
          onClick={() => handleVote('upvote')}
          disabled={false}
        >
          ▲
        </button>
        <button
          className={`vote-button ${userVote === 'downvote' ? 'active' : ''}`}
          onClick={() => handleVote('downvote')}
          disabled={false}
        >
          ▼
        </button>
      </div>
    </div>
  )
}