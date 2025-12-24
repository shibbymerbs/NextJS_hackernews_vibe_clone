import Link from 'next/link';
import { getUserById, getStoriesByUser, getAllCommentsByUser } from '@/lib/users';

export default async function UserPage({
    params
}: {
    params: { id: string }
}) {
    const user = await getUserById(params.id);
    if (!user) return <div className="container mx-auto px-4 py-8">User not found</div>;

    const [stories, commentsData] = await Promise.all([
        getStoriesByUser(user.id),
        getAllCommentsByUser(user.id)
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-hn-dark-gray mb-6">User: {user.name}</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-hn-dark-gray mb-4">Stories ({stories.length})</h2>
                {stories.length === 0 ? (
                    <p className="text-hn-light-gray">No stories posted yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {stories.map(story => (
                            <li key={story.id} className="border-b border-hn-border pb-3">
                                <Link href={`/story/${story.id}`} className="hn-link text-lg">{story.title}</Link>
                                <div className="text-sm text-hn-light-gray mt-1">
                                    {story.url ? (
                                        <span>{story.url}</span>
                                    ) : (
                                        <span>Show HN: {story.text?.substring(0, 200)}...</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-hn-dark-gray mb-4">Comments ({commentsData.topLevel.length + commentsData.replies.length})</h2>
                {commentsData.topLevel.length === 0 && commentsData.replies.length === 0 ? (
                    <p className="text-hn-light-gray">No comments posted yet.</p>
                ) : (
                    <div className="space-y-3">
                        {commentsData.topLevel.map(comment => (
                            <div key={comment.id} className="border-b border-hn-border pb-3">
                                <CommentItem comment={comment} />
                            </div>
                        ))}
                        {commentsData.replies.map(reply => (
                            <div key={reply.id} className="border-b border-hn-border pb-3">
                                <CommentItem comment={reply} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Calculate time ago
    function timeAgo(date: Date): string {
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (seconds < 60) return `${seconds} seconds ago`
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) === 1 ? '' : 's'} ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) === 1 ? '' : 's'} ago`
        return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) === 1 ? '' : 's'} ago`
    }

    function CommentItem({ comment }: { comment: any }) {
        return (
            <div className={`ml-${comment.depth ? comment.depth * 2 : 0} pl-4`}>
                <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-hn-light-gray" title={new Date(comment.createdAt).toDateString() + ' ' + new Date(comment.createdAt).toLocaleTimeString()} >{timeAgo(new Date(comment.createdAt))}</span>
                </div>
                <p className="whitespace-pre-line">{comment.text}</p>
                <span className="text-sm text-hn-light-gray">in <Link href={`/story/${comment.storyId}`} className="hn-link">{comment.story?.title || 'story'}</Link></span>
            </div>
        );
    }
}