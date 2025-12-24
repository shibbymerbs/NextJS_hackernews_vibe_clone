import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth-server'

export async function GET(request: Request) {
    // Check for showhnId query parameter to get user's vote on a specific showhn
    const { searchParams } = new URL(request.url)
    const showhnId = searchParams.get('showhnId')

    if (showhnId) {
        // Verify the request has cookies attached
        const cookieHeader = request.headers.get('cookie')
        if (!cookieHeader) {
            console.warn('No cookie header in request for showhns vote check')
        }

        const session = await getSession()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login to check votes' },
                { status: 401 }
            )
        }

        // Find existing vote for this showhn
        const vote = await prisma.vote.findFirst({
            where: {
                userId: String(session.user.id),
                showHnId: showhnId
            }
        })

        if (vote) {
            return NextResponse.json({ type: vote.type })
        } else {
            return NextResponse.json(null)
        }
    }

    // Original GET handler for listing all showhns
    const showhns = await prisma.showHN.findMany({
        include: {
            user: true,
            _count: {
                select: { votes: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return NextResponse.json(showhns)
}

export async function POST(request: Request) {
    // Verify the request has cookies attached
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
        console.warn('No cookie header in request for showhns POST')
    }

    const session = await getSession()
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized - Please login to post' },
            { status: 401 }
        )
    }

    const body = await request.json()
    const { title, url, text } = body

    if (!title) {
        return NextResponse.json(
            { error: 'Title is required' },
            { status: 400 }
        )
    }

    const showhn = await prisma.showHN.create({
        data: {
            title,
            url,
            text,
            userId: String(session.user.id)
        }
    })

    return NextResponse.json(showhn, { status: 201 })
}

export async function PUT(request: Request) {
    // Verify the request has cookies attached
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
        console.warn('No cookie header in request for showhns PUT')
    }

    const session = await getSession()
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized - Please login to vote' },
            { status: 401 }
        )
    }

    const body = await request.json()
    const { showhnId, voteType } = body

    if (!showhnId || !voteType) {
        return NextResponse.json(
            { error: 'showhnId and voteType are required' },
            { status: 400 }
        )
    }

    // Find existing vote using the unique constraint [userId, showHnId]
    let vote = await prisma.vote.findFirst({
        where: {
            userId: String(session.user.id),
            showHnId: showhnId
        }
    })

    if (vote) {
        // Update existing vote
        const updatedVote = await prisma.vote.update({
            where: { id: vote.id },
            data: { type: voteType }
        })
        return NextResponse.json(updatedVote)
    } else {
        // Create new vote
        const newVote = await prisma.vote.create({
            data: {
                showHnId: showhnId,
                userId: String(session.user.id),
                type: voteType
            }
        })
        return NextResponse.json(newVote)
    }
}