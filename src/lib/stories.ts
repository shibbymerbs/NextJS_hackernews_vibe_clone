import prisma from './db'
import type { Story, Comment, Vote, StoryWithVotes, StoryWithFreshness, StoryWithComments } from '@/types'

/**
 * Create a new story (for both links and ask posts)
 * @param userId - User ID who created the story
 * @param title - Story title
 * @param url - URL (optional for text-only "ask" stories)
 * @param text - Text content (optional)
 * @returns Created story or null if failed
 */
export async function createStory(userId: string | null, title: string, url: string | null = null, text: string | null = null): Promise<Story | null> {
  try {
    // Check if user exists, create if not (for demo purposes)
    let user = null
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
    }

    if (!user && userId) {
      throw new Error('User not found')
    }

    const story = await prisma.story.create({
      data: {
        userId: user?.id || null,
        title,
        url,
        text
      },
      include: {
        user: true
      }
    })

    return story
  } catch (error) {
    console.error('Error creating story:', error)
    return null
  }
}

/**
 * Recursively fetch all children comments for a given parent comment
 * @param parentId - The parent comment ID to fetch children for
 * @returns Array of child comments with their own children recursively loaded
 */
async function getCommentChildrenRecursive(parentId: string | null): Promise<Comment[]> {
  if (!parentId) {
    return []
  }

  const children = await prisma.comment.findMany({
    where: { parentId },
    include: {
      user: true,
      _count: {
        select: { children: true }
      }
    },
    orderBy: [
      {
        points: 'desc'
      },
      {
        createdAt: 'asc'
      }
    ]
  })

  // Recursively load grandchildren for each child
  const childrenWithGrandchildren = await Promise.all(
    children.map(async (child) => {
      const grandchildren = await getCommentChildrenRecursive(child.id)
      return {
        ...child,
        children: grandchildren.length > 0 ? grandchildren : undefined
      }
    })
  )

  return childrenWithGrandchildren
}

/**
 * Get all comments for a story with infinite nesting support
 * @param storyId - The story ID to fetch comments for
 * @returns Array of top-level comments with recursively loaded children
 */
async function getCommentsForStoryRecursive(storyId: string): Promise<Comment[]> {
  const topLevelComments = await prisma.comment.findMany({
    where: {
      storyId,
      parentId: null // Only top-level comments
    },
    include: {
      user: true,
      _count: {
        select: { children: true }
      }
    },
    orderBy: [
      {
        points: 'desc'
      },
      {
        createdAt: 'asc'
      }
    ]
  })

  // Recursively load children for each top-level comment
  const commentsWithChildren = await Promise.all(
    topLevelComments.map(async (comment) => {
      const children = await getCommentChildrenRecursive(comment.id)
      return {
        ...comment,
        children: children.length > 0 ? children : undefined
      }
    })
  )

  return commentsWithChildren
}

export async function getStoryById(id: string): Promise<StoryWithComments | null> {
  try {
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        user: true,
        _count: {
          select: { comments: true }
        }
      }
    })

    if (!story) {
      return null
    }

    // Fetch comments recursively with infinite nesting
    const comments = await getCommentsForStoryRecursive(id)

    return {
      ...story,
      comments: comments.length > 0 ? comments : undefined
    }
  } catch (error) {
    console.error('Error fetching story:', error)
    return null
  }
}

export async function getAllStories(): Promise<Story[]> {
  try {
    const stories = await prisma.story.findMany({
      include: {
        user: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return stories
  } catch (error) {
    console.error('Error fetching stories:', error)
    return []
  }
}

export async function createComment(storyId: string | null, showHnId: string | null, userId: string | null, text: string, parentId: string | null = null): Promise<Comment | null> {
  try {
    // Check if story or showHN exists (only required for top-level comments)
    let postExists = false

    if (!parentId) {
      // For top-level comments, we need either storyId or showHnId
      if (storyId) {
        const story = await prisma.story.findUnique({
          where: { id: storyId }
        })
        postExists = !!story
      } else if (showHnId) {
        const showHn = await prisma.showHN.findUnique({
          where: { id: showHnId }
        })
        postExists = !!showHn
      }

      if (!postExists) {
        console.error(`Story with ID ${storyId} or ShowHN with ID ${showHnId} not found`)
        return null
      }
    } else {
      // For replies (parentId provided), inherit storyId/showHnId from parent comment
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { storyId: true, showHnId: true }
      })

      if (!parentComment) {
        console.error(`Parent comment with ID ${parentId} not found`)
        return null
      }

      // Inherit from parent - ignore the storyId/showHnId parameters when parentId is provided
      storyId = parentComment.storyId || null
      showHnId = parentComment.showHnId || null

      if (!storyId && !showHnId) {
        console.error(`Parent comment ${parentId} doesn't belong to a valid post`)
        return null
      }
    }

    // Set the post reference that exists (story or showHN)
    const commentData: any = {
      userId,
      text,
      parentId
    }

    // At least one of storyId or showHnId must be set for the foreign key constraint
    if (storyId) {
      commentData.storyId = storyId
    } else if (showHnId) {
      commentData.showHnId = showHnId
    }

    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        user: true
      }
    })

    return comment
  } catch (error) {
    console.error('Error creating comment:', error)
    return null
  }
}

export async function getCommentsByStoryId(storyId: string): Promise<Comment[]> {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        storyId,
        parentId: null // Only top-level comments
      },
      include: {
        user: true,
        children: {
          include: {
            user: true,
            children: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: [
        {
          points: 'desc'
        },
        {
          createdAt: 'asc'
        }
      ]
    })

    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function upvoteStory(storyId: string, userId: string): Promise<{ success: boolean; action?: string; newVoteType?: 'upvote' | 'downvote' | null, error?: string }> {
  try {
    // Check if user exists, create if not (for demo purposes)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: 'Demo User'
        }
      })
    }

    // Check if user already voted on this story
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      }
    })

    if (existingVote) {
      // If user already voted, update the vote type
      if (existingVote.type === 'upvote') {
        // Remove upvote
        await prisma.vote.delete({
          where: {
            id: existingVote.id
          }
        })
        // Decrement story points
        await prisma.story.update({
          where: { id: storyId },
          data: { points: { decrement: 1 } }
        })
        return { success: true, action: 'removed', newVoteType: null }
      } else {
        // Change from downvote to upvote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: 'upvote' }
        })
        // Increment story points by 2 (remove downvote -1, add upvote +1)
        await prisma.story.update({
          where: { id: storyId },
          data: { points: { increment: 2 } }
        })
        return { success: true, action: 'changed', newVoteType: 'upvote' }
      }
    } else {
      // Create new upvote
      await prisma.vote.create({
        data: {
          userId,
          storyId,
          type: 'upvote'
        }
      })
      // Increment story points
      await prisma.story.update({
        where: { id: storyId },
        data: { points: { increment: 1 } }
      })
      return { success: true, action: 'added', newVoteType: 'upvote' }
    }
  } catch (error) {
    console.error('Error upvoting story:', error)
    return { success: false, error: 'Failed to upvote story' }
  }
}

export async function downvoteStory(storyId: string, userId: string): Promise<{ success: boolean; action?: string; newVoteType?: 'upvote' | 'downvote' | null, error?: string }> {
  try {
    // Check if user already voted on this story
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      }
    })

    if (existingVote) {
      // If user already voted, update the vote type
      if (existingVote.type === 'downvote') {
        // Remove downvote
        await prisma.vote.delete({
          where: {
            id: existingVote.id
          }
        })
        // Increment story points
        await prisma.story.update({
          where: { id: storyId },
          data: { points: { increment: 1 } }
        })
        return { success: true, action: 'removed', newVoteType: null }
      } else {
        // Change from upvote to downvote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: 'downvote' }
        })
        // Decrement story points by 2 (remove upvote +1, add downvote -1)
        await prisma.story.update({
          where: { id: storyId },
          data: { points: { decrement: 2 } }
        })
        return { success: true, action: 'changed', newVoteType: 'downvote' }
      }
    } else {
      // Create new downvote
      await prisma.vote.create({
        data: {
          userId,
          storyId,
          type: 'downvote'
        }
      })
      // Decrement story points
      await prisma.story.update({
        where: { id: storyId },
        data: { points: { decrement: 1 } }
      })
      return { success: true, action: 'added', newVoteType: 'downvote' }
    }
  } catch (error) {
    console.error('Error downvoting story:', error)
    return { success: false, error: 'Failed to downvote story' }
  }
}

export async function getUserVote(storyId: string, userId: string): Promise<Vote | null> {
  try {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      }
    })
    return vote
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return null
  }
}

export async function upvoteComment(commentId: string, userId: string): Promise<{ success: boolean; action?: string; newVoteType?: 'upvote' | 'downvote' | null, error?: string }> {
  try {
    // Check if user exists, create if not (for demo purposes)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: 'Demo User'
        }
      })
    }

    // Check if user already voted on this comment
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        commentId
      }
    })

    if (existingVote) {
      // If user already voted, update the vote type
      if (existingVote.type === 'upvote') {
        // Remove upvote
        await prisma.vote.delete({
          where: {
            id: existingVote.id
          }
        })
        // Decrement comment points, but don't go below 0
        const comment = await prisma.comment.findUnique({
          where: { id: commentId }
        })

        if (comment && comment.points > 0) {
          await prisma.comment.update({
            where: { id: commentId },
            data: { points: { decrement: 1 } }
          })
        }
        return { success: true, action: 'removed', newVoteType: null }
      } else {
        // Change from downvote to upvote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: 'upvote' }
        })
        // Increment comment points by 2 (remove downvote -1, add upvote +1)
        await prisma.comment.update({
          where: { id: commentId },
          data: { points: { increment: 2 } }
        })
        return { success: true, action: 'changed', newVoteType: 'upvote' }
      }
    } else {
      // Create new upvote
      await prisma.vote.create({
        data: {
          userId,
          commentId,
          type: 'upvote'
        }
      })
      // Increment comment points
      await prisma.comment.update({
        where: { id: commentId },
        data: { points: { increment: 1 } }
      })
      return { success: true, action: 'added', newVoteType: 'upvote' }
    }
  } catch (error) {
    console.error('Error upvoting comment:', error)
    return { success: false, error: 'Failed to upvote comment' }
  }
}

export async function downvoteComment(commentId: string, userId: string): Promise<{ success: boolean; action?: string; newVoteType?: 'upvote' | 'downvote' | null, error?: string }> {
  try {
    // Check if user exists, create if not (for demo purposes)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: 'Demo User'
        }
      })
    }

    // Check if user already voted on this comment
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    })

    if (existingVote) {
      // If user already voted, update the vote type
      if (existingVote.type === 'downvote') {
        // Remove downvote
        await prisma.vote.delete({
          where: {
            id: existingVote.id
          }
        })
        // Increment comment points
        await prisma.comment.update({
          where: { id: commentId },
          data: { points: { increment: 1 } }
        })
        return { success: true, action: 'removed', newVoteType: null }
      } else {
        // Change from upvote to downvote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: 'downvote' }
        })
        // Decrement comment points by 2 (remove upvote +1, add downvote -1), but don't go below 0
        const comment = await prisma.comment.findUnique({
          where: { id: commentId }
        })

        if (comment && comment.points >= 2) {
          await prisma.comment.update({
            where: { id: commentId },
            data: { points: { decrement: 2 } }
          })
        } else if (comment && comment.points > 0) {
          await prisma.comment.update({
            where: { id: commentId },
            data: { points: { decrement: comment.points } }
          })
        }
        return { success: true, action: 'changed', newVoteType: 'downvote' }
      }
    } else {
      // Create new downvote
      await prisma.vote.create({
        data: {
          userId,
          commentId,
          type: 'downvote'
        }
      })
      // Decrement comment points
      await prisma.comment.update({
        where: { id: commentId },
        data: { points: { decrement: 1 } }
      })
      return { success: true, action: 'added', newVoteType: 'downvote' }
    }
  } catch (error) {
    console.error('Error downvoting comment:', error)
    return { success: false, error: 'Failed to downvote comment' }
  }
}

export async function getUserCommentVote(commentId: string, userId: string): Promise<Vote | null> {
  try {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    })
    return vote
  } catch (error) {
    console.error('Error fetching user comment vote:', error)
    return null
  }
}

/**
 * Calculate freshness score for stories based on vote metrics
 * @param story - Story object with vote and time data
 * @param now - Current timestamp for calculation
 * @returns Freshness score (higher = fresher)
 */
export function calculateFreshnessScore(story: Story, now: Date = new Date()): number {
  // Base freshness factors
  const submissionTime = new Date(story.createdAt)
  const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

  // Get most recent vote time (if any votes exist)
  let lastVoteTime = submissionTime
  if (story.votes && story.votes.length > 0) {
    const recentVotes = story.votes.sort((a: Vote, b: Vote) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    lastVoteTime = new Date(recentVotes[0].createdAt)
  }

  const hoursSinceLastVote = (now.getTime() - lastVoteTime.getTime()) / (1000 * 60 * 60)

  // Freshness algorithm parameters (can be tuned)
  const BASE_FRESHNESS = 100
  const TIME_DECAY_RATE = 0.1 // How quickly freshness decays over time
  const VOTE_WEIGHT = 0.5 // How much votes contribute to freshness
  const RECENT_VOTE_BOOST = 1.5 // Boost for recent voting activity
  const ENGAGEMENT_WEIGHT = 0.3 // How much engagement (comments) contributes

  // Calculate time-based freshness (decays over time)
  const timeFreshness = BASE_FRESHNESS * Math.exp(-TIME_DECAY_RATE * hoursSinceSubmission)

  // Calculate vote-based freshness
  const voteFreshness = story.points * VOTE_WEIGHT

  // Calculate recent activity boost (recent votes keep content fresh)
  const recentActivityBoost = RECENT_VOTE_BOOST * Math.exp(-0.05 * hoursSinceLastVote)

  // Calculate engagement freshness (comments = engagement)
  const engagementFreshness = (story._count?.comments || 0) * ENGAGEMENT_WEIGHT

  // Combine all factors
  const freshnessScore =
    timeFreshness +
    voteFreshness +
    recentActivityBoost +
    engagementFreshness

  return Math.max(0, freshnessScore) // Ensure non-negative score
}

/**
 * Get stories sorted by freshness algorithm
 * @param page - Page number for pagination (default: 1)
 * @param pageSize - Number of stories per page (default: 20)
 * @returns Stories sorted by freshness score with pagination
 */
export async function getStoriesByFreshness(page: number = 1, pageSize: number = 20): Promise<{ stories: StoryWithFreshness[], totalCount: number }> {
  try {
    const now = new Date()

    // Get all stories with their votes and comment counts
    const stories = await prisma.story.findMany({
      include: {
        user: true,
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    // Fetch votes separately for each story to avoid complex include issues
    const storiesWithVotes = await Promise.all(
      stories.map(async (story) => {
        const votes = await prisma.vote.findMany({
          where: {
            storyId: story.id
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
        return {
          ...story,
          votes
        }
      })
    )

    // Calculate freshness score for each story
    const storiesWithFreshness = stories.map((story: Story) => ({
      ...story,
      freshnessScore: calculateFreshnessScore(story, now)
    }))

    // Sort by freshness score (highest first)
    const sortedStories = storiesWithFreshness.sort((a: StoryWithFreshness, b: StoryWithFreshness) =>
      b.freshnessScore - a.freshnessScore
    )

    // Apply pagination
    const totalCount = sortedStories.length
    const startIndex = (page - 1) * pageSize
    const paginatedStories = sortedStories.slice(startIndex, startIndex + pageSize)

    return {
      stories: paginatedStories,
      totalCount
    }
  } catch (error) {
    console.error('Error fetching stories by freshness:', error)
    return { stories: [], totalCount: 0 }
  }
}

/**
 * Calculate freshness score for comments
 * @param comment - Comment object with vote and time data
 * @param now - Current timestamp for calculation
 * @returns Freshness score (higher = fresher)
 */
export function calculateCommentFreshnessScore(comment: Comment, now: Date = new Date()): number {
  const submissionTime = new Date(comment.createdAt)
  const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

  // Get most recent vote time (if any votes exist)
  let lastVoteTime = submissionTime
  if (comment.votes && comment.votes.length > 0) {
    const recentVotes = comment.votes.sort((a: Vote, b: Vote) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    lastVoteTime = new Date(recentVotes[0].createdAt)
  }

  const hoursSinceLastVote = (now.getTime() - lastVoteTime.getTime()) / (1000 * 60 * 60)

  // Freshness algorithm parameters for comments
  const BASE_FRESHNESS = 50
  const TIME_DECAY_RATE = 0.15 // Comments decay faster than stories
  const VOTE_WEIGHT = 0.7 // Votes more important for comments
  const RECENT_VOTE_BOOST = 2.0 // Recent votes more important for comments
  const REPLY_WEIGHT = 0.4 // Replies keep comments fresh

  // Calculate time-based freshness
  const timeFreshness = BASE_FRESHNESS * Math.exp(-TIME_DECAY_RATE * hoursSinceSubmission)

  // Calculate vote-based freshness
  const voteFreshness = comment.points * VOTE_WEIGHT

  // Calculate recent activity boost
  const recentActivityBoost = RECENT_VOTE_BOOST * Math.exp(-0.05 * hoursSinceLastVote)

  // Calculate reply freshness
  const replyFreshness = (comment._count?.children || 0) * REPLY_WEIGHT

  // Combine all factors
  const freshnessScore =
    timeFreshness +
    voteFreshness +
    recentActivityBoost +
    replyFreshness

  return Math.max(0, freshnessScore)
}