'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CommentForm({ storyId, showHnId }: { storyId?: string; showHnId?: string }) {
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          showHnId,
          text: commentText,
          userId: null // Allow null userId for anonymous comments
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      // Reset form and show success
      setCommentText('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Refresh the page to show the new comment
      router.refresh()

    } catch (err) {
      setError('Failed to submit comment. Please try again.')
      console.error('Comment submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your comment..."
          className="w-full p-3 border border-hn-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-hn-orange focus:border-transparent"
          rows={4}
          disabled={isSubmitting}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Comment submitted successfully!</p>}
      <button
        type="submit"
        disabled={isSubmitting || !commentText.trim()}
        className="px-4 py-2 bg-hn-orange text-white rounded-md hover:bg-hn-orange-dark disabled:bg-hn-light-gray disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  )
}