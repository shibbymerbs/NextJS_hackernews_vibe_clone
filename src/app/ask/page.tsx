import Link from 'next/link'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'

async function createStory(formData: FormData) {
  'use server'

  const title = formData.get('title') as string
  const text = formData.get('text') as string

  if (!title || !text) {
    // In a real app, you might want to handle this error properly
    // For now, we'll just create with whatever we have
  }

  try {
    await prisma.story.create({
      data: {
        title,
        text,
        // For ask page, we don't have a URL, so it's a text-based story
        url: null,
        userId: null // No user association for anonymous questions
      }
    })

    // Redirect to home page after successful submission
    redirect('/')
  } catch (error) {
    console.error('Error creating story:', error)
    // Redirect even on error to avoid form resubmission issues
    redirect('/')
  }
}

export default function AskPage() {

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-hn-dark-gray">Ask HN</h2>
        <p className="text-hn-dark-gray mb-6">Submit a question to ask the Hacker News community.</p>

        <form action={createStory} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-hn-dark-gray mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-hn-orange focus:border-transparent"
              placeholder="What's your question?"
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-hn-dark-gray mb-1">
              Text (optional)
            </label>
            <textarea
              id="text"
              name="text"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-hn-orange focus:border-transparent"
              placeholder="Add more details to your question..."
            />
          </div>

          <button
            type="submit"
            className="hn-button"
          >
            Submit Question
          </button>
        </form>
      </div>
    </main>
  )
}