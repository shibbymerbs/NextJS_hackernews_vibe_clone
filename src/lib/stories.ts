import prisma from './db'

export async function getStoryById(id: string) {
  try {
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        user: true,
        comments: {
          include: {
            user: true,
            children: {
              include: {
                user: true,
                children: true
              }
            }
          }
        }
      }
    })

    return story
  } catch (error) {
    console.error('Error fetching story:', error)
    return null
  }
}

export async function getAllStories() {
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

export async function createComment(storyId: string, userId: string | null, text: string, parentId: string | null = null) {
  try {
    const comment = await prisma.comment.create({
      data: {
        storyId,
        userId,
        text,
        parentId
      },
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

export async function getCommentsByStoryId(storyId: string) {
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
      orderBy: {
        createdAt: 'asc'
      }
    })

    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function upvoteStory(storyId: string, userId: string) {
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

export async function downvoteStory(storyId: string, userId: string) {
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

export async function getUserVote(storyId: string, userId: string) {
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