import Link from 'next/link'
import ShowHNForm from '@/components/ShowHNForm'
import { getShowHNsByFreshness } from '@/lib/showhns'

interface ShowHNPost {
    id: string
    title: string
    url: string | null
    points: number
    createdAt: Date | string
    _count?: {
        comments: number
    }
}

export default async function ShowPage() {
    const showhns = await getShowHNsByFreshness()

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <ShowHNForm />

            <div className="space-y-4">
                {showhns.map((post, index: number) => (
                    <div key={post.id} className="story-item">
                        <div className="flex items-start space-x-2">
                            <span className="text-hn-dark-gray text-sm">{index + 1}.</span>
                            <div className="flex-1">
                                <h2 className="text-base font-medium">
                                    {post.url ? (
                                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="hn-link">{post.title || 'Untitled'}</a>
                                    ) : (
                                        <span className="hn-link">{post.title || 'Untitled'}</span>
                                    )}
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <p className="text-sm text-hn-dark-gray">
                                        {post.points} points | <Link href={`/show/${post.id}`} className="hn-link">{post._count?.comments || 0} comments</Link>
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