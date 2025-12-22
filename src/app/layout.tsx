import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hacker News Clone',
  description: 'A Next.js implementation of Hacker News',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-hn-gray min-h-screen`}>
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Header />
          {children}
        </div>
      </body>
    </html>
  )
}