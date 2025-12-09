import { NextResponse } from 'next/server'
import { getAllStories, getStoriesByFreshness } from '@/lib/stories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort')

    let stories
    if (sort === 'freshness') {
      // Use freshness algorithm for sorting
      stories = await getStoriesByFreshness()
    } else {
      // Default sorting (by creation date)
      stories = await getAllStories()
    }

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json([], { status: 500 })
  }
}