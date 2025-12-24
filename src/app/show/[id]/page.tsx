import Link from 'next/link'
import { notFound } from 'next/navigation'
import db from '@/lib/db'
import CommentForm from '@/components/CommentForm'

interface ShowHNPost {
    id: string
    title: string
    url: string | null
    points: number
    createdAt: Date | string
}

export default async function ShowHNPostPage({
    params,
}: {
    params: { id: string }
}) {
    const post = await db.showHN.findUnique({
        where: { id: params.id },
    })

    if (!post) {
        notFound()
    }

    const comments = await db.comment.findMany({
        where: { showHnId: params.id },
        include: {
            user: true,
            _count: {
                select: { votes: true }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <article className="mb-8">
                <h1 className="text-xl font-medium mb-2">{post.title}</h1>
                {post.url && (
                    <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        {post.url}
                    </a>
                )}
                <p className="text-sm text-hn-dark-gray mt-2">
                    {post.points} | posted at {new Date(post.createdAt).toLocaleString()}
                </p>
            </article>

            <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">{comments.length} comments</h2>
                <CommentForm showHnId={post.id} />
            </div>

            <div className="space-y-6">
                {comments.map((comment, index: number) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-1">
                                <p className="text-sm text-hn-dark-gray mb-2">
                                    by {comment.user?.name || 'anonymous'} {comment._count?.votes}
                                </p>
                                <p className="whitespace-pre-wrap">{comment.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}