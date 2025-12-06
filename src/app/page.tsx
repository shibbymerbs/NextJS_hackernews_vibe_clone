import Link from 'next/link'
import { getAllStories } from '@/lib/stories'
import VoteButtons from '@/components/VoteButtons'

interface Story {
  id: string
  title: string
  points: number
  userId: string | null
  user: {
    name: string | null
  } | null
  _count: {
    comments: number
  }
}

export default async function Home() {
  const stories: Story[] = await getAllStories()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-hn-orange">
          <Link href="/" className="hn-link">Hacker News</Link>
        </h1>
        <nav className="flex space-x-4">
          <Link href="/new" className="hn-link">new</Link>
          <Link href="/ask" className="hn-link">ask</Link>
          <Link href="/show" className="hn-link">show</Link>
          <Link href="/jobs" className="hn-link">jobs</Link>
        </nav>
      </header>

      <div className="space-y-4">
        {stories.map((story, index) => (
          <div key={story.id} className="story-item">
            <div className="flex items-start space-x-2">
              <span className="text-hn-dark-gray text-sm">{index + 1}.</span>
              <div className="flex-1">
                <h2 className="text-base font-medium">
                  <Link href={`/story/${story.id}`} className="hn-link">{story.title}</Link>
                </h2>
                <div className="flex items-center space-x-4">
                  <VoteButtons
                    storyId={story.id}
                    initialPoints={story.points}
                    userId={null} // For now, we'll use null userId
                  />
                  <p className="text-sm text-hn-dark-gray">
                    by <Link href={`/user/${story.userId}`} className="hn-link">{story.user?.name || 'anonymous'}</Link> | <Link href={`/story/${story.id}`} className="hn-link">{story._count.comments} comments</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}