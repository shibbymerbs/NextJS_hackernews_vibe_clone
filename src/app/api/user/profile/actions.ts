'use server';

import { revalidatePath } from 'next/cache';
import { redirect, RedirectType } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/db';

export async function updateUserProfile(formData: FormData): Promise<void> {
    const session = await getSession();
    const userId = formData.get('userId') as string;
    const bio = formData.get('bio') as string;
    const websiteUrl = formData.get('websiteUrl') as string;

    // Verify the user is authenticated and owns this profile
    if (!session?.user || session.user.id !== userId) {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                bio: bio || null,
                websiteUrl: websiteUrl || null
            }
        });

        // Revalidate the cache for this user's page
        revalidatePath(`/user/${userId}`);

        // Redirect back to the user's profile with a success message
        redirect(`/user/${userId}?message=profile_updated`, RedirectType.replace);
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile');
    }
}