import { NextResponse } from 'next/server'
import { getAllStories, getStoriesByFreshness } from '@/lib/stories'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth-server'

export async function GET(request: Request) {
  try {
    // Verify the request has cookies attached
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      console.warn('No cookie header in request for stories GET')
    }

    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort')
    const pageParam = searchParams.get('page') || '1'
    const limitParam = searchParams.get('limit') || '20'

    // Parse pagination parameters with validation
    const page = Math.max(1, parseInt(pageParam, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20))

    let stories
    if (sort === 'freshness') {
      // Use freshness algorithm for sorting with pagination
      const { stories: freshStories } = await getStoriesByFreshness(page, limit)
      stories = freshStories
    } else {
      // Default sorting (by creation date) - TODO: add pagination here too
      stories = await getAllStories()
    }

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify the request has cookies attached
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      console.warn('No cookie header in request for stories POST')
    }

    const session = await getSession()
    const body = await request.json()
    const { title, text, url } = body

    // Require authentication for posting stories
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to post a story' },
        { status: 401 }
      )
    }

    const userId = String(session.user.id)

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const story = await prisma.story.create({
      data: {
        title,
        text,
        url,
        userId
      }
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}