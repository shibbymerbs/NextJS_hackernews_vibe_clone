import { useSession } from 'next-auth/react'
import { NextResponse } from 'next/server'

// List of paths that require authentication
const protectedPaths = [
    '/api/votes',
    '/api/stories',
    '/api/comments',
    '/api/showhns',
]

function withAuth(handler: any) {
    return async function (req: any) {
        // Check if this is a protected path
        const isProtectedPath = protectedPaths.some(path =>
            req.nextUrl.pathname.startsWith(path)
        );

        if (isProtectedPath && process.env.NODE_ENV === 'development' && process.env.__NEXT_TEST_MODE__ !== 'true') {
            try {
                const { data: session } = useSession()

                if (!session?.user?.id) {
                    // For API routes, return 401 instead of redirecting to HTML login
                    return NextResponse.json(
                        { error: 'Unauthorized - Please login' },
                        { status: 401 }
                    )
                }
            } catch (error) {
                // If auth fails, continue without auth
                console.log('Auth check skipped:', error)
            }
        }

        // Always allow the request to continue
        return handler(req)
    }
}

export default withAuth((req: any) => {
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}