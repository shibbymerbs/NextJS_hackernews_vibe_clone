import Link from 'next/link'
import { getStoryById } from '@/lib/stories'
import CommentForm from '@/components/CommentForm'
import VoteButtons from '@/components/VoteButtons'
import CommentVoteButtons from '@/components/CommentVoteButtons'
import { StoryWithComments, Comment } from '@/types'

export default async function StoryPage({
  params,
}: {
  params: { id: string }
}): Promise<JSX.Element> {
  // Fetch story from database
  const resolvedParams = await params
  const story = await getStoryById(resolvedParams.id)

  if (!story) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-bold mb-4">Story Not Found</h1>
          <p className="text-hn-dark-gray">The requested story could not be found.</p>
          <Link href="/" className="hn-link mt-4 inline-block">← Back to home</Link>
        </div>
      </main>
    )
  }

  // Calculate time ago
  const timeAgo = (date: Date): string => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  // Render comments recursively
  const renderComments = (comments: Comment[], depth = 0): JSX.Element[] => {
    return comments.map(comment => (
      <div key={comment.id} className={`ml-${depth * 4} mt-4 pt-2 border-l border-hn-light-gray pl-4`}>
        <div className="flex items-start space-x-2">
          <CommentVoteButtons
            commentId={comment.id}
            initialPoints={comment.points}
            userId={null}
          />
          <div className="flex-1">

            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-hn-dark-gray">{comment.user?.name || 'anonymous'}</span>
              <span className="text-sm text-hn-light-gray">{timeAgo(new Date(comment.createdAt))}</span>

            </div>
            <p className="text-base text-hn-darkest-gray whitespace-pre-wrap">{comment.text}</p>
            {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
          </div>
        </div>
      </div>
    ))
  }

  if (!story) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-bold mb-4">Story Not Found</h1>
          <p className="text-hn-dark-gray">The requested story could not be found.</p>
          <Link href="/" className="hn-link mt-4 inline-block">← Back to home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-hn-darkest-gray mb-2">{story.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-hn-dark-gray mb-4">
            <VoteButtons
              storyId={story.id}
              initialPoints={story.points}
              userId={null} // For now, we'll use null userId
            />
            <span>by <Link href={`/user/${story.userId}`} className="hn-link font-medium">{story.user?.name || 'anonymous'}</Link></span>
            <span>{timeAgo(new Date(story.createdAt))}</span>
            <span>{story.comments?.length || 0} comments</span>
          </div>
          {story.url && (
            <a href={story.url} target="_blank" rel="noopener noreferrer" className="hn-link text-hn-blue">
              {new URL(story.url).hostname}
            </a>
          )}
        </header>

        <div className="prose max-w-none mb-8">
          <p className="text-base text-hn-darkest-gray whitespace-pre-wrap">{story.text}</p>
        </div>

        <section className="mt-8 pt-4 border-t border-hn-light-gray">
          <h2 className="text-lg font-semibold text-hn-darkest-gray mb-4">{story.comments?.length || 0} Comments</h2>
          {story.comments && story.comments.length > 0 ? (
            <div className="space-y-4">
              {renderComments(story.comments)}
            </div>
          ) : (
            <p className="text-hn-dark-gray">No comments yet.</p>
          )}
        </section>

        <section className="mt-8 pt-4 border-t border-hn-light-gray">
          <h2 className="text-lg font-semibold text-hn-darkest-gray mb-4">Add a Comment</h2>
          <CommentForm storyId={story.id} />
        </section>

        <div className="mt-8">
          <Link href="/" className="hn-link">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}