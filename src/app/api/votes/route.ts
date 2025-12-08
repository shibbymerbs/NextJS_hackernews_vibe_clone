import { NextResponse } from 'next/server'
import {
  upvoteStory,
  downvoteStory,
  getUserVote,
  upvoteComment,
  downvoteComment,
  getUserCommentVote
} from '@/lib/stories'

export async function POST(request: Request) {
  try {
    const { storyId, commentId, action, userId } = await request.json()

    if ((!storyId && !commentId) || !action || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if ((!storyId && !commentId) || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (storyId) {
      // Handle story vote lookup
      const vote = await getUserVote(storyId, userId)
      return NextResponse.json({ vote: vote?.type || null })
    } else if (commentId) {
      // Handle comment vote lookup
      const vote = await getUserCommentVote(commentId, userId)
      return NextResponse.json({ vote: vote?.type || null })
    } else {
      return NextResponse.json({ error: 'Either storyId or commentId must be provided' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}