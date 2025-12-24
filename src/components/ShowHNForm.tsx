'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { auth } from '@/auth'

export default function ShowHNForm() {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { data: session, status } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/showhns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    url: url.trim() || null
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                if (response.status === 401 && data.error?.includes('login')) {
                    window.location.href = '/login'
                    return
                }
                throw new Error(data.error || `HTTP error! status: ${response.status}`)
            }

            // Refresh the page to show the new post
            router.refresh()
        } catch (err) {
            console.error('Error submitting Show HN:', err)
            setError(err instanceof Error ? err.message : 'Failed to submit Show HN')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mb-8 p-4 bg-gray-100 rounded">
            {!session?.user ? (
                <div className="text-center py-4">
                    <p className="text-red-500 mb-2">Please login to submit Show HN</p>
                    <a
                        href="/login"
                        className="inline-block px-4 py-2 bg-hn-orange text-white rounded hover:bg-orange-600"
                    >
                        Login with GitHub
                    </a>
                </div>
            ) : (
                <>
                    <h2 className="text-lg font-medium mb-4">Submit a Show HN</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Show HN: My amazing project"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium mb-1">URL (optional)</label>
                            <input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/my-project"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded ${isSubmitting ? 'bg-hn-orange opacity-70' : 'bg-hn-orange hover:bg-orange-600'} text-white font-medium`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}