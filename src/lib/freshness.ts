/**
 * Freshness algorithm utilities for Hacker News
 * Calculates content freshness based on vote counts, last vote time, submission time, and total votes
 */

interface StoryWithMetrics {
  id: string
  points: number
  createdAt: Date | string
  votes?: Array<{
    createdAt: Date | string
  }>
  _count?: {
    comments: number
  }
}

interface CommentWithMetrics {
  id: string
  points: number
  createdAt: Date | string
  votes?: Array<{
    createdAt: Date | string
  }>
  _count?: {
    children: number
  }
}

/**
 * Calculate freshness score for stories based on vote metrics
 * @param story - Story object with vote and time data
 * @param now - Current timestamp for calculation
 * @returns Freshness score (higher = fresher)
 */
export function calculateStoryFreshness(story: StoryWithMetrics, now: Date = new Date()): number {
  // Convert dates to Date objects if they're strings
  const submissionTime = new Date(story.createdAt)
  const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

  // Get most recent vote time (if any votes exist)
  let lastVoteTime = submissionTime
  if (story.votes && story.votes.length > 0) {
    const recentVotes = [...story.votes].sort((a, b) =>
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
 * Calculate freshness score for comments
 * @param comment - Comment object with vote and time data
 * @param now - Current timestamp for calculation
 * @returns Freshness score (higher = fresher)
 */
export function calculateCommentFreshness(comment: CommentWithMetrics, now: Date = new Date()): number {
  const submissionTime = new Date(comment.createdAt)
  const hoursSinceSubmission = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60)

  // Get most recent vote time (if any votes exist)
  let lastVoteTime = submissionTime
  if (comment.votes && comment.votes.length > 0) {
    const recentVotes = [...comment.votes].sort((a, b) =>
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

/**
 * Sort stories by freshness score
 * @param stories - Array of stories with metrics
 * @returns Stories sorted by freshness (highest first)
 */
export function sortStoriesByFreshness(stories: StoryWithMetrics[]): StoryWithMetrics[] {
  const now = new Date()
  return [...stories].sort((a, b) => {
    const scoreA = calculateStoryFreshness(a, now)
    const scoreB = calculateStoryFreshness(b, now)
    return scoreB - scoreA // Higher scores first
  })
}

/**
 * Sort comments by freshness score
 * @param comments - Array of comments with metrics
 * @returns Comments sorted by freshness (highest first)
 */
export function sortCommentsByFreshness(comments: CommentWithMetrics[]): CommentWithMetrics[] {
  const now = new Date()
  return [...comments].sort((a, b) => {
    const scoreA = calculateCommentFreshness(a, now)
    const scoreB = calculateCommentFreshness(b, now)
    return scoreB - scoreA // Higher scores first
  })
}