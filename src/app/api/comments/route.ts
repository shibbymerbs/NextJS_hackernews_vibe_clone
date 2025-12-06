import { NextResponse } from 'next/server'
import { createComment, getCommentsByStoryId } from '@/lib/stories'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get('storyId')

  if (!storyId) {
    return NextResponse.json({ error: 'storyId is required' }, { status: 400 })
  }

  try {
    const comments = await getCommentsByStoryId(storyId)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { storyId, text, parentId, userId } = await request.json()

    if (!storyId || !text) {
      return NextResponse.json({ error: 'storyId and text are required' }, { status: 400 })
    }

    const comment = await createComment(storyId, userId || null, text, parentId)

    if (!comment) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}