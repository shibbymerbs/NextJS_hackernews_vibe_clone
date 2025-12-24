'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
    currentPage: number
    totalPages: number
}

// Create page numbers to display (show current and neighbors)
export const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
        // Show all pages if there are few
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
        return pages
    }

    // Always show first page
    pages.push(1)

    // Show left ellipsis if needed
    if (currentPage > 3) {
        pages.push('left-ellipsis')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    // Show right ellipsis if needed
    if (currentPage < totalPages - 2) {
        pages.push('right-ellipsis')
    }

    // Always show last page
    pages.push(totalPages)

    return pages
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    return (
        <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
            {currentPage > 1 && (
                <Link
                    href={createPageURL(currentPage - 1)}
                    className="px-3 py-2 text-sm rounded border hover:bg-gray-100"
                >
                    Previous
                </Link>
            )}

            {getPageNumbers(currentPage, totalPages).map((page, index) => {
                if (page === 'left-ellipsis') {
                    return (
                        <span key={`left-ellipsis-${index}`} className="px-3 py-2 text-sm">
                            ...
                        </span>
                    )
                }

                if (page === 'right-ellipsis') {
                    return (
                        <span key={`right-ellipsis-${index}`} className="px-3 py-2 text-sm">
                            ...
                        </span>
                    )
                }

                return (
                    <Link
                        key={String(page)}
                        href={createPageURL(Number(page))}
                        className={`px-3 py-2 text-sm rounded border ${currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                            }`}
                    >
                        {page}
                    </Link>
                )
            })}

            {currentPage < totalPages && (
                <Link
                    href={createPageURL(currentPage + 1)}
                    className="px-3 py-2 text-sm rounded border hover:bg-gray-100"
                >
                    Next
                </Link>
            )}
        </div>
    )
}