import { auth as nextAuth } from '@/auth'

/**
 * Wrapper for NextAuth's auth() that handles Edge Runtime limitations
 * This function will return null in Edge Runtime to avoid PrismaClient errors
 */
export async function auth() {
    try {
        // Check if we're running in Edge Runtime
        const isEdgeRuntime = typeof process === 'undefined' ||
            (process as any).env.NEXT_RUNTIME === 'edge'

        if (isEdgeRuntime) {
            // In Edge Runtime, we can't use PrismaClient through @auth/prisma-adapter
            // Return null to indicate no session is available in Edge context
            return null
        }

        // Normal Node.js runtime - use NextAuth's auth()
        return await nextAuth()
    } catch (error) {
        console.error('Auth error:', error)
        return null
    }
}

export { handlers, signIn, signOut } from '@/auth'