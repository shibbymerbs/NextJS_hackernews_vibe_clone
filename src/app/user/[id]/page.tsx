import { getUserById, getStoriesByUser, getAllCommentsByUser } from '@/lib/users';
import { getSession } from '@/lib/auth-server';
import UserPageClient from '@/components/UserPageClient';
// Server component wrapper
async function UserPageServer({
    params,
    searchParams
}: {
    params: { id: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const user = await getUserById(params.id);
    const session = await getSession();
    const stories = await getStoriesByUser(params.id);
    const commentsData = await getAllCommentsByUser(params.id);

    return (
        <UserPageClient
            user={user}
            session={session}
            stories={stories}
            commentsData={commentsData}
            searchParams={searchParams}
        />
    );
}

export default UserPageServer;