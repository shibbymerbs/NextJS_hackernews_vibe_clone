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