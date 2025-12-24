'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { updateUserProfile } from '@/app/api/user/profile/actions';

export default function UserPageClient({
    user,
    session,
    stories,
    commentsData,
    searchParams
}: {
    user: any;
    session: any;
    stories: any[];
    commentsData: any;
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const initialState = { success: false };
    const updateProfileWithState = async (prevState: any, formData: FormData) => {
        // Call the server action with the form data
        return await updateUserProfile(formData);
    };
    const [state, formAction] = useFormState(updateProfileWithState, initialState);

    if (!user) return <div className="container mx-auto px-4 py-8">User not found</div>;

    const isOwner = session?.user?.id === user.id;

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
                <p className="whitespace-pre-line border-l-2 border-hn-light-gray pl-2">{comment.text}</p>
                <span className="text-sm text-hn-light-gray">in <Link href={`/story/${comment.storyId}`} className="hn-link">{comment.story?.title || 'story'}</Link></span>
                <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-hn-light-gray" title={new Date(comment.createdAt).toDateString() + ' ' + new Date(comment.createdAt).toLocaleTimeString()} >{timeAgo(new Date(comment.createdAt))}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-hn-dark-gray mb-6">User: {user.name}</h1>

            {(user.bio || user.websiteUrl) && (
                <div className="mb-6 p-4 bg-hn-light-gray rounded">
                    {user.bio && (
                        <p className="mb-2">{user.bio}</p>
                    )}
                    {user.websiteUrl && (
                        <a href={user.websiteUrl} className="hn-link" target="_blank" rel="noopener noreferrer">
                            {user.websiteUrl}
                        </a>
                    )}
                </div>
            )}

            {isOwner && (
                <div className="mb-6 p-4 bg-hn-light-gray rounded collapsible">
                    <h3 className="text-lg font-semibold mb-2">Edit Profile</h3>
                    <form action={formAction} className="space-y-4">
                        <input type="hidden" name="userId" value={user.id} />
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                defaultValue={user.bio || ''}
                                className="w-full p-2 border border-hn-border rounded"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">Website URL</label>
                            <input
                                id="websiteUrl"
                                name="websiteUrl"
                                defaultValue={user.websiteUrl || ''}
                                type="url"
                                className="w-full p-2 border border-hn-border rounded"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save Profile
                        </button>
                    </form>
                </div>
            )}

            {isOwner && session?.user && (
                <div className="mb-6">
                    {/* Check for form submission result */}
                    {state?.success && (
                        <div className="p-4 bg-green-100 text-green-800 rounded border border-green-300">
                            {state.success && 'Profile updated successfully!'}
                        </div>
                    )}
                </div>
            )}

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
                        {commentsData.topLevel.map((comment: any) => (
                            <div key={comment.id} className="border-b border-hn-border pb-3">
                                <CommentItem comment={comment} />
                            </div>
                        ))}
                        {commentsData.replies.map((reply: any) => (
                            <div key={reply.id} className="border-b border-hn-border pb-3">
                                <CommentItem comment={reply} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
