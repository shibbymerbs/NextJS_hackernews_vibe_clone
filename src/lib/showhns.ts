import prisma from './db'

/**
 * Create a new Show HN post
 * @param userId - User ID who created the post
 * @param title - Post title
 * @param url - URL to the project
 * @returns Created ShowHN post or null if failed
 */
export async function createShowHN(userId: string | null, title: string, url: string) {
    try {
        // Check if user exists, create if not (for demo purposes)
        let user = null
        if (userId) {
            user = await prisma.user.findUnique({
                where: { id: userId }
            })
        }

        if (!user && userId) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    name: 'Demo User'
                }
            })
        }

        const showhn = await prisma.showHN.create({
            data: {
                userId: user?.id || null,
                title,
                url
            },
            include: {
                user: true
            }
        })

        return showhn
    } catch (error) {
        console.error('Error creating Show HN post:', error)
        return null
    }
}

/**
 * Get a Show HN post by ID
 * @param id - Post ID
 * @returns ShowHN post or null if not found
 */
export async function getShowHNById(id: string) {
    try {
        const showhn = await prisma.showHN.findUnique({
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

        return showhn
    } catch (error) {
        console.error('Error fetching Show HN post:', error)
        return null
    }
}

/**
 * Get all Show HN posts
 * @returns Array of ShowHN posts
 */
export async function getAllShowHNs() {
    try {
        const showhns = await prisma.showHN.findMany({
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

        return showhns
    } catch (error) {
        console.error('Error fetching Show HN posts:', error)
        return []
    }
}

/**
 * Calculate freshness score for Show HN posts
 * @param post - ShowHN post object with vote and time data
 * @param now - Current timestamp for calculation
 * @returns Freshness score (higher = fresher)
 */
export function calculateShowHNFreshnessScore(post: any, now: Date = new Date()): number {
    // Base freshness factors
    const submissionTime = new Date(post.createdAt)
    const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

    // Get most recent vote time (if any votes exist)
    let lastVoteTime = submissionTime
    if (post.votes && post.votes.length > 0) {
        const recentVotes = post.votes.sort((a: any, b: any) =>
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
    const voteFreshness = post.points * VOTE_WEIGHT

    // Calculate recent activity boost (recent votes keep content fresh)
    const recentActivityBoost = RECENT_VOTE_BOOST * Math.exp(-0.05 * hoursSinceLastVote)

    // Calculate engagement freshness (comments = engagement)
    const engagementFreshness = (post._count?.comments || 0) * ENGAGEMENT_WEIGHT

    // Combine all factors
    const freshnessScore =
        timeFreshness +
        voteFreshness +
        recentActivityBoost +
        engagementFreshness

    return Math.max(0, freshnessScore) // Ensure non-negative score
}

/**
 * Get Show HN posts sorted by freshness algorithm
 * @returns ShowHN posts sorted by freshness score
 */
export async function getShowHNsByFreshness() {
    try {
        const now = new Date()

        // Get all Show HN posts with their votes and comment counts
        const showhns = await prisma.showHN.findMany({
            include: {
                user: true,
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        })

        // Fetch votes separately for each post to avoid complex include issues
        const showhnsWithVotes = await Promise.all(
            showhns.map(async (post) => {
                const votes = await prisma.vote.findMany({
                    where: {
                        showHnId: post.id
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
                return {
                    ...post,
                    votes
                }
            })
        )

        // Calculate freshness score for each post
        const showhnsWithFreshness = showhns.map(post => ({
            ...post,
            freshnessScore: calculateShowHNFreshnessScore(post, now)
        }))

        // Sort by freshness score (highest first)
        const sortedShowHNs = showhnsWithFreshness.sort((a, b) =>
            b.freshnessScore - a.freshnessScore
        )

        return sortedShowHNs
    } catch (error) {
        console.error('Error fetching Show HN posts by freshness:', error)
        return []
    }
}