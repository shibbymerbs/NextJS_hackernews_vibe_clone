import Link from 'next/link'
import { getStoriesByFreshness } from '@/lib/stories'
import VoteButtons from '@/components/VoteButtons'

interface Story {
    id: string
    title: string
    points: number
    userId: string | null
    user?: {
        name: string | null
    } | null
    _count?: {
        comments?: number
    }
    createdAt: Date | string
}

export default async function NewPage() {
    const stories: Story[] = await getStoriesByFreshness()

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
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
                                        by <Link href={`/user/${story.userId}`} className="hn-link">{story.user?.name || 'anonymous'}</Link> | <Link href={`/story/${story.id}`} className="hn-link">{story._count?.comments ?? 0} comments</Link>
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