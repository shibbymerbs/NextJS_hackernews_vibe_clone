import Link from 'next/link'
import { getStoriesByFreshness } from '@/lib/stories'
import VoteButtons from '@/components/VoteButtons'
import Pagination from '@/components/Pagination'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
  const currentPage = isNaN(page) || page < 1 ? 1 : page

  // Get paginated stories and total count
  const { stories, totalCount } = await getStoriesByFreshness(currentPage)

  // Calculate total pages (20 stories per page)
  const totalPages = Math.ceil(totalCount / 20)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-4">
        {stories.map((story, index: number) => (
          <div key={story.id} className="story-item">
            <div className="flex items-start space-x-2">
              <span className="text-hn-dark-gray text-sm">{index + 1}.</span>
              <div className="flex-1">
                <h2 className="text-base font-medium">
                  <Link href={`/story/${story.id}`} className="hn-link">{story.title || 'Untitled'}</Link>
                </h2>
                <div className="flex items-center space-x-4">
                  <VoteButtons
                    storyId={story.id}
                    initialPoints={story.points}
                  />
                  <p className="text-sm text-hn-dark-gray">
                    by <Link href={`/user/${story.userId}`} className="hn-link">{story.user?.name || 'anonymous'}</Link> | <Link href={`/story/${story.id}`} className="hn-link">{story._count?.comments || 0} comments</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </main>
  )
}