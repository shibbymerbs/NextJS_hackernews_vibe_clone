import { NextResponse } from 'next/server'
import {
  upvoteStory,
  downvoteStory,
  getUserVote,
  upvoteComment,
  downvoteComment,
  getUserCommentVote,
  getStoriesByFreshness
} from '@/lib/stories'
import { sortStoriesByFreshness, sortCommentsByFreshness } from '@/lib/freshness'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()

    // Get user ID from session
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to vote' },
        { status: 401 }
      )
    }

    const userId = String(session.user.id)
    const storyId = body.storyId
    const commentId = body.commentId
    const action = body.action

    if (storyId) {
      // Handle story voting
      if (action === 'upvote') {
        const result = await upvoteStory(storyId, userId)
        return NextResponse.json(result)
      } else if (action === 'downvote') {
        const result = await downvoteStory(storyId, userId)
        return NextResponse.json(result)
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } else if (commentId) {
      // Handle comment voting
      if (action === 'upvote') {
        const result = await upvoteComment(commentId, userId)
        return NextResponse.json(result)
      } else if (action === 'downvote') {
        const result = await downvoteComment(commentId, userId)
        return NextResponse.json(result)
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Either storyId or commentId must be provided' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const sortType = searchParams.get('sort')

    // Get user ID from session for vote lookup
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to check votes' },
        { status: 401 }
      )
    }

    const userId = String(session.user.id)

    // Handle freshness sorting requests (public)
    if (sortType === 'freshness') {
      const stories = await getStoriesByFreshness()
      return NextResponse.json(stories)
    }

    // Handle vote lookup requests
    const storyId = searchParams.get('storyId')
    const commentId = searchParams.get('commentId')

    if (!storyId && !commentId) {
      return NextResponse.json({ error: 'Either storyId or commentId must be provided' }, { status: 400 })
    }

    if (storyId) {
      // Handle story vote lookup
      const vote = await getUserVote(storyId, userId)
      return NextResponse.json({ vote: vote?.type || null })
    } else if (commentId) {
      // Handle comment vote lookup
      const vote = await getUserCommentVote(commentId, userId)
      return NextResponse.json({ vote: vote?.type || null })
    }
  } catch (error) {
    console.error('Error handling vote request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
