import { calculateStoryFreshness, sortStoriesByFreshness } from '../src/lib/freshness';

describe('Story Freshness Algorithm', () => {
    it('should return higher freshness for newer stories with same votes', () => {
        const now = new Date();
        const recentStory = {
            id: 'story1',
            points: 5,
            createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
            votes: [],
            _count: { comments: 2 }
        };

        const olderStory = {
            id: 'story2',
            points: 5,
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
            votes: [],
            _count: { comments: 2 }
        };

        const recentFreshness = calculateStoryFreshness(recentStory, now);
        const olderFreshness = calculateStoryFreshness(olderStory, now);

        expect(recentFreshness).toBeGreaterThan(olderFreshness);
    });

    it('should return higher freshness for stories with more votes', () => {
        const now = new Date();
        const storyWithFewVotes = {
            id: 'story1',
            points: 2,
            createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            votes: [],
            _count: { comments: 0 }
        };

        const storyWithManyVotes = {
            id: 'story2',
            points: 20,
            createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            votes: [],
            _count: { comments: 0 }
        };

        const fewVotesFreshness = calculateStoryFreshness(storyWithFewVotes, now);
        const manyVotesFreshness = calculateStoryFreshness(storyWithManyVotes, now);

        expect(manyVotesFreshness).toBeGreaterThan(fewVotesFreshness);
    });

    it('should sort stories by freshness (highest first)', () => {
        const now = new Date();
        const stories = [
            {
                id: 'story1',
                points: 5,
                createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
                votes: [],
                _count: { comments: 2 }
            },
            {
                id: 'story2',
                points: 3,
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
                votes: [],
                _count: { comments: 0 }
            },
            {
                id: 'story3',
                points: 20,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
                votes: [],
                _count: { comments: 5 }
            }
        ];

        const sorted = sortStoriesByFreshness(stories);
        expect(sorted[0].id).toBe('story3'); // Should be first (highest freshness)
        expect(sorted[2].id).toBe('story1'); // Should be last (lowest freshness)
    });

    it('should return non-negative freshness scores', () => {
        const now = new Date();
        const veryOldStory = {
            id: 'old-story',
            points: 0,
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
            votes: [],
            _count: { comments: 0 }
        };

        const freshness = calculateStoryFreshness(veryOldStory, now);
        expect(freshness).toBeGreaterThanOrEqual(0);
    });
});