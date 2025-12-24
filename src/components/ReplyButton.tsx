'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import CommentForm from './CommentForm'

export default function ReplyButton({ parentId }: { parentId: string }) {
    const [showReplyForm, setShowReplyForm] = useState(false)
    const { data: session, status } = useSession()

    return (
        <div className="mt-2">
            {!showReplyForm ? (
                !session?.user ? (
                    <a
                        href="/login"
                        className="text-sm text-hn-blue hover:underline"
                    >
                        Login to reply
                    </a>
                ) : (
                    <button
                        onClick={() => setShowReplyForm(true)}
                        className="text-sm text-hn-blue hover:underline"
                    >
                        Reply
                    </button>
                )
            ) : (
                <div className="mt-4 ml-4 pl-4 border-l border-hn-light-gray">
                    {session?.user && <CommentForm parentId={parentId} />}
                    <button
                        onClick={() => setShowReplyForm(false)}
                        className="text-sm text-hn-blue hover:underline mt-2"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}