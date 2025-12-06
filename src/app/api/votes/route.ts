import { NextResponse } from 'next/server'
import { upvoteStory, downvoteStory, getUserVote } from '@/lib/stories'

export async function POST(request: Request) {
  try {
    const { storyId, action, userId } = await request.json()

    if (!storyId || !action || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'upvote') {
      const result = await upvoteStory(storyId, userId)
      return NextResponse.json(result)
    } else if (action === 'downvote') {
      const result = await downvoteStory(storyId, userId)
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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
    const userId = searchParams.get('userId')

    if (!storyId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const vote = await getUserVote(storyId, userId)
    return NextResponse.json({ vote: vote?.type || null })
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}