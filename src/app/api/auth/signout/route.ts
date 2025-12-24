import { auth, signOut } from '@/lib/auth-edge'

export async function GET() {
    const session = await auth();
    if (session) {
        return await signOut({ redirectTo: '/' });
    }
    return new Response(null, { status: 401 });
}