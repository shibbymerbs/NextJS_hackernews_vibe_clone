import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = cookies()

    return NextResponse.json({
        sessionToken: cookieStore.get('next-auth.session-token')?.value || 'NOT FOUND',
        callbackUrl: cookieStore.get('next-auth.callback-url')?.value || 'NOT FOUND',
        csrfToken: cookieStore.get('next-auth.csrf-token')?.value || 'NOT FOUND'
    })
}