'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/db';

export async function updateUserProfile(formData: FormData): Promise<{ success: boolean; message?: string }> {
    const session = await getSession();
    const userId = formData.get('userId') as string;
    const bio = formData.get('bio') as string;
    const websiteUrl = formData.get('websiteUrl') as string;

    // Verify the user is authenticated and owns this profile
    if (!session?.user || session.user.id !== userId) {
        return { success: false, message: 'Unauthorized' };
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

        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: 'Failed to update profile' };
    }
}