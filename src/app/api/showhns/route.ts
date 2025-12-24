import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
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
    const session = await auth()
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
    const session = await auth()
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