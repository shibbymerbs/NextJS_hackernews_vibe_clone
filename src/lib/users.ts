import prisma from './db'
import type { User, Story, Comment } from '@/types'

/**
 * Get a user by their ID
 * @param id - User ID
 * @returns User object or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        })
        return user || null
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}

/**
 * Get all stories created by a specific user
 * @param userId - User ID
 * @returns Array of stories created by the user
 */
export async function getStoriesByUser(userId: string): Promise<Story[]> {
    try {
        const stories = await prisma.story.findMany({
            where: { userId },
            include: {
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
        console.error('Error fetching stories by user:', error)
        return []
    }
}

/**
 * Get all top-level comments created by a specific user
 * @param userId - User ID
 * @returns Array of top-level comments created by the user
 */
export async function getTopLevelCommentsByUser(userId: string): Promise<Comment[]> {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                userId,
                parentId: null // Only top-level comments
            },
            include: {
                _count: {
                    select: { children: true }
                },
                story: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                showHn: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return comments
    } catch (error) {
        console.error('Error fetching top-level comments by user:', error)
        return []
    }
}

/**
 * Get all comments (including replies) created by a specific user
 * @param userId - User ID
 * @returns Array of all comments created by the user, grouped by parent comment
 */
export async function getAllCommentsByUser(userId: string): Promise<{
    topLevel: Comment[]
    replies: Comment[]
}> {
    try {
        // Get top-level comments
        const topLevel = await prisma.comment.findMany({
            where: {
                userId,
                parentId: null
            },
            include: {
                _count: {
                    select: { children: true }
                },
                story: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                showHn: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Get all replies (comments with parentId)
        const replies = await prisma.comment.findMany({
            where: {
                userId,
                parentId: { not: null }
            },
            include: {
                _count: {
                    select: { children: true }
                },
                story: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                showHn: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        text: true,
                        userId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { topLevel, replies }
    } catch (error) {
        console.error('Error fetching all comments by user:', error)
        return { topLevel: [], replies: [] }
    }
}