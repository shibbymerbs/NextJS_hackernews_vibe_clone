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