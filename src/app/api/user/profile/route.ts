import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export async function POST(request: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const bio = formData.get('bio') as string | null;
        const websiteUrl = formData.get('websiteUrl') as string | null;

        // Verify the user owns this profile
        if (session.user.id !== userId) {
            return NextResponse.json(
                { error: 'You can only edit your own profile' },
                { status: 403 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                bio,
                websiteUrl
            }
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}