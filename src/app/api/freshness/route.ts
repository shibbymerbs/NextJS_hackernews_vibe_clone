import { NextResponse } from 'next/server'
import { calculateStoryFreshness, calculateCommentFreshness, sortStoriesByFreshness, sortCommentsByFreshness } from '@/lib/freshness'
import prisma from '@/lib/db'

/**
 * Freshness API endpoint
 * Provides freshness-based sorting for stories and comments
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stories'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (type === 'stories') {
      // Get stories with comment counts for freshness calculation
      const stories = await prisma.story.findMany({
        include: {
          user: true,
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      })

      // For now, use a simplified freshness calculation without vote data
      // due to Prisma client issues. This can be enhanced later.
      const now = new Date()
      const storiesWithFreshness = stories.map(story => {
        const submissionTime = new Date(story.createdAt)
        const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

        // Simplified freshness score (can be enhanced with vote data later)
        const timeFreshness = 100 * Math.exp(-0.1 * hoursSinceSubmission)
        const voteFreshness = story.points * 0.5
        const engagementFreshness = (story._count?.comments || 0) * 0.3

        const freshnessScore = timeFreshness + voteFreshness + engagementFreshness

        return {
          ...story,
          freshnessScore
        }
      })

      // Sort by freshness
      const freshStories = storiesWithFreshness.sort((a, b) =>
        b.freshnessScore - a.freshnessScore
      )

      return NextResponse.json({
        success: true,
        stories: freshStories,
        count: freshStories.length
      })

    } else if (type === 'comments') {
      // Get comments with reply counts for freshness calculation
      const comments = await prisma.comment.findMany({
        include: {
          user: true,
          _count: {
            select: {
              children: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      })

      // Simplified freshness calculation for comments
      const now = new Date()
      const commentsWithFreshness = comments.map(comment => {
        const submissionTime = new Date(comment.createdAt)
        const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

        // Simplified freshness score
        const timeFreshness = 50 * Math.exp(-0.15 * hoursSinceSubmission)
        const voteFreshness = comment.points * 0.7
        const replyFreshness = (comment._count?.children || 0) * 0.4

        const freshnessScore = timeFreshness + voteFreshness + replyFreshness

        return {
          ...comment,
          freshnessScore
        }
      })

      // Sort by freshness
      const freshComments = commentsWithFreshness.sort((a, b) =>
        b.freshnessScore - a.freshnessScore
      )

      return NextResponse.json({
        success: true,
        comments: freshComments,
        count: freshComments.length
      })

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Use "stories" or "comments"'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in freshness API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Calculate freshness score for a specific story
 */
export async function POST(request: Request) {
  try {
    const { storyId } = await request.json()

    if (!storyId) {
      return NextResponse.json({
        success: false,
        error: 'storyId is required'
      }, { status: 400 })
    }

    // Get story with comment counts
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: true,
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    if (!story) {
      return NextResponse.json({
        success: false,
        error: 'Story not found'
      }, { status: 404 })
    }

    // Calculate simplified freshness score
    const now = new Date()
    const submissionTime = new Date(story.createdAt)
    const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

    const timeFreshness = 100 * Math.exp(-0.1 * hoursSinceSubmission)
    const voteFreshness = story.points * 0.5
    const engagementFreshness = (story._count?.comments || 0) * 0.3

    const freshnessScore = timeFreshness + voteFreshness + engagementFreshness

    return NextResponse.json({
      success: true,
      storyId: story.id,
      freshnessScore,
      points: story.points,
      commentCount: story._count?.comments || 0,
      timeSinceSubmissionHours: hoursSinceSubmission
    })

  } catch (error) {
    console.error('Error calculating story freshness:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}