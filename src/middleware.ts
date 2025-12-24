import { auth } from '@/auth'
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
        const session = await auth()

        if (!session?.user?.id && req.nextUrl.pathname.startsWith('/api/')) {
            // Redirect to login page with redirect URL
            const url = new URL('/login', req.nextUrl.origin)
            return NextResponse.redirect(url)
        }

        return handler(req)
    }
}

export default withAuth((req: any) => {
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}