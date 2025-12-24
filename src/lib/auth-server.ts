import { auth as nextAuth } from '@/auth'

/**
 * Get session data for Server Components
 * Uses NextAuth's built-in auth function which handles JWT cookies automatically
 */
export async function getSession() {
    try {
        const session = await nextAuth()
        return session || null
    } catch (error) {
        console.error('Session error:', error)
        return null
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
    const session = await getSession()
    return !!session?.user
}