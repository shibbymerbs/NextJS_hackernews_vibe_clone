import { getSession } from '@/lib/auth-server'
import Link from 'next/link'

export default async function TestAuthPage() {
    const session = await getSession()

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>

            {session?.user ? (
                <div>
                    <p>Logged in as: {session.user.name}</p>
                    <p>User ID: {session.user.id}</p>
                    <p>Email: {session.user.email}</p>
                </div>
            ) : (
                <div className="mt-4">
                    <p>Not logged in</p>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </div>
            )}

            <div className="mt-4">
                <Link href="/api/debug-cookies" className="text-blue-600 hover:underline">
                    Check Cookies API
                </Link>
            </div>


        </div>
    )
}