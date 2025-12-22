import Link from 'next/link'

export default function Header() {
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
            </nav>
        </header>
    )
}