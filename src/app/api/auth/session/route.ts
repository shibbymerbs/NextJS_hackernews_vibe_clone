import { auth as nextAuth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await nextAuth()
        if (!session) {
            return NextResponse.json({ user: null }, { status: 200 })
        }

        const user = session?.user
        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 })
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name || user.email,
                email: user.email
            },
            expires: session.expires ? new Date(session.expires).toISOString() : null
        })
    } catch (error) {
        console.error('Session error:', error)
        return NextResponse.json({ user: null }, { status: 200 })
    }
}