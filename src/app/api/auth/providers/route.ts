import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
    // const session = await auth;
    // if (!session?.user) {
    //     return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    //         status: 401,
    //         headers: { 'Content-Type': 'application/json' },
    //     });
    // }

    // In NextAuth v4, providers are available from the config
    const providers = {
        github: {
            id: 'github',
            name: 'GitHub',
            type: 'oauth' as const,
            signinUrl: '/api/auth/signin/github',
            callbackUrl: '/api/auth/callback/github'
        }
    };

    return NextResponse.json(providers);
}