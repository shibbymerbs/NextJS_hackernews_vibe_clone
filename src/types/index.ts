/**
 * Type definitions for Hacker News application
 * Based on Prisma schema models
 */

import { Prisma } from '@prisma/client'

/** User model with relations */
export interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    passwordHash?: string | null
    createdAt: Date
    updatedAt: Date
}

/** Simplified user type for API responses */
export interface ApiUser {
    name: string | null;
}

/** Story model with relations */
export interface Story {
    id: string
    userId: string | null
    title: string
    url?: string | null
    text?: string | null
    points: number
    createdAt: Date
    updatedAt: Date
    user?: ApiUser | null
    _count?: {
        comments?: number
    }
    votes?: Vote[]
}

/** Story with votes for freshness calculation */
export interface StoryWithVotes extends Story {
    votes?: Vote[]
}

/** Story with comments and votes (for detailed view) */
export interface StoryWithComments extends Story {
    comments?: Comment[]
    votes?: Vote[]
}

/** Story with freshness score */
export interface StoryWithFreshness extends Story {
    freshnessScore: number
}

/** Comment model with relations */
export interface Comment {
    id: string
    userId: string | null
    storyId?: string | null
    showHnId?: string | null
    parentId?: string | null
    text: string
    points: number
    createdAt: Date
    updatedAt: Date
    user?: ApiUser | null
    children?: Comment[]
    _count?: {
        children?: number
    }
    votes?: Vote[]
}

/** Comment with votes for freshness calculation */
export interface CommentWithVotes extends Comment {
    votes?: Vote[]
}

/** ShowHN (Show HN) model with relations */
export interface ShowHN {
    id: string
    userId: string | null
    title: string
    url?: string | null
    text?: string | null
    points: number
    createdAt: Date
    updatedAt: Date
    user?: User | null
    _count?: {
        comments?: number
    }
}

/** ShowHN with votes for freshness calculation */
export interface ShowHNWithVotes extends ShowHN {
    votes?: Array<{
        id: string
        userId: string
        showHnId?: string | null
        type: string
        createdAt: Date
    }>
}

/** Vote model */
export interface Vote {
    id: string
    userId: string
    storyId?: string | null
    commentId?: string | null
    showHnId?: string | null
    type: string
    createdAt: Date
}

/** Story with freshness score */
export interface StoryWithFreshness extends Story {
    freshnessScore: number
}

/** Comment with freshness score */
export interface CommentWithFreshness extends Comment {
    freshnessScore: number
}

/** ShowHN with freshness score */
export interface ShowHNWithFreshness extends ShowHN {
    freshnessScore: number
}