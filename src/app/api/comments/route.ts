import { NextResponse } from 'next/server'
import { createComment, getCommentsByStoryId } from '@/lib/stories'
import { auth } from '@/auth'

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
    const session = await auth()
    const body = await request.json()

    // Require authentication for posting comments
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to post a comment' },
        { status: 401 }
      )
    }

    const userId = String(session.user.id)
    const { storyId, showHnId, text, parentId } = body

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    // For replies (parentId provided), we don't require explicit storyId/showHnId
    // as they will be inherited from the parent comment in createComment
    if (!storyId && !showHnId && !parentId) {
      return NextResponse.json({ error: 'Either storyId or showHnId is required' }, { status: 400 })
    }

    const comment = await createComment(storyId, showHnId, userId || null, text, parentId)

    if (!comment) {
      return NextResponse.json({ error: 'Failed to create comment - validation failed' }, { status: 400 })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}