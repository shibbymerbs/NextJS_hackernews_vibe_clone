import { signOut } from '@/lib/auth-edge'

export async function GET() {
    return signOut({ redirectTo: '/' });
}