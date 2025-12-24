'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ShowHNVoteButtonsProps {
    showhnId: string
    initialPoints: number
    className?: string
}

export default function ShowHNVoteButtons({ showhnId, initialPoints, className = '' }: ShowHNVoteButtonsProps) {
    const { data: session, status } = useSession()
    const [points, setPoints] = useState(initialPoints)
    const [userVote, setUserVote] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Get user ID from session - voting requires login
    const effectiveUserId = session?.user?.id

    useEffect(() => {
        const fetchUserVote = async () => {
            try {
                const response = await fetch(`/api/showhns?showhnId=${showhnId}`)
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

        if (effectiveUserId) {
            fetchUserVote()
        }
    }, [showhnId, effectiveUserId])

    const handleVote = async (voteType: 'upvote' | 'downvote') => {

        try {
            const response = await fetch('/api/showhns', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    showhnId,
                    type: voteType
                }),
            })

            const result = await response.json()

            if (response.ok) {
                // Update UI based on the vote result
                if (result.vote) {
                    const newVote = result.vote
                    if (newVote === 'upvote') {
                        setPoints(points + 1)
                        setUserVote('upvote')
                    } else {
                        setPoints(points - 1)
                        setUserVote('downvote')
                    }
                } else {
                    // Vote was removed
                    if (userVote === 'upvote') {
                        setPoints(points - 1)
                    } else if (userVote === 'downvote') {
                        setPoints(points + 1)
                    }
                    setUserVote(null)
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

    // Disable voting if not logged in
    const isLoggedIn = !!effectiveUserId

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
                        className={`vote-button ${userVote === 'upvote' ? 'active' : ''}`}
                        onClick={() => handleVote('upvote')}
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
                        className={`vote-button ${userVote === 'downvote' ? 'active' : ''}`}
                        onClick={() => handleVote('downvote')}
                        disabled={!isLoggedIn}
                    >
                        ▼
                    </button>
                )}
            </div>
        </div>
    )
}