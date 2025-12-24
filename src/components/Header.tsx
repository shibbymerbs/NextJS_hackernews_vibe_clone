import Link from 'next/link'
import { getSession } from '@/lib/auth-server'

export default async function Header() {
    const session = await getSession()
    return (
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-hn-orange">
                <Link href="/" className="hn-link">Hacker News</Link>
            </h1>
            <nav className="flex space-x-4">
                <Link href="/new" className="hn-link">new</Link>
                <Link href="/ask" className="hn-link">ask</Link>
                <Link href="/show" className="hn-link">show</Link>
                <Link href="/jobs" className="hn-link">jobs</Link>
                {session?.user ? (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {(session.user as any).name || (session.user as any).email}
                        </span>
                        <Link
                            href="/api/auth/signout"
                            className="hn-link text-red-500 hover:text-red-700"
                        >
                            logout
                        </Link>
                    </div>
                ) : (
                    <Link href="/login" className="hn-link">
                        login
                    </Link>
                )}
            </nav>
        </header>
    )
}