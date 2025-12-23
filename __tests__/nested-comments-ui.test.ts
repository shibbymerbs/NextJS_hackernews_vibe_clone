import { prisma } from '../jest.setup';

describe('Nested Comments UI Integration', () => {
    let testUser: any;
    let testStory: any;
    let testEmail: string;

    beforeAll(async () => {
        // Create test user with unique email to avoid conflicts
        const timestamp = Date.now();
        testEmail = `test${timestamp}@example.com`;
        testUser = await prisma.user.create({
            data: {
                name: 'Test User',
                email: testEmail
            }
        });

        // Create test story
        testStory = await prisma.story.create({
            data: {
                title: 'Test Story for Nested Comments',
                text: 'This is a test story to verify nested comment functionality.',
                url: 'https://example.com/test',
                userId: testUser.id,
                points: 0
            }
        });
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.comment.deleteMany({
            where: { storyId: testStory.id }
        });

        await prisma.story.delete({
            where: { id: testStory.id }
        });

        await prisma.user.delete({
            where: { email: testEmail }
        });

        await prisma.$disconnect();
    });

    it('should create a complete nested comment hierarchy', async () => {
        // Create root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id,
                points: 0
            }
        });

        // Create first-level reply (parentId set)
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id,  // This is the key for nested comments
                points: 0
            }
        });

        // Create second-level reply (parentId set to reply1)
        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: reply1.id,  // Nested reply
                points: 0
            }
        });

        expect(rootComment.text).toBe('Root level comment');
        expect(reply1.parentId).toBe(rootComment.id);
        expect(reply2.parentId).toBe(reply1.id);
    });

    it('should verify the complete hierarchy structure', async () => {
        // Create root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id,
                points: 0
            }
        });

        // Create first-level reply
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id,
                points: 0
            }
        });

        // Create second-level reply
        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: reply1.id,
                points: 0
            }
        });

        // Verify the hierarchy is correct
        const commentsWithChildren = await prisma.comment.findMany({
            where: {
                storyId: testStory.id,
                parentId: null  // Only root comments
            },
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            }
        });

        expect(commentsWithChildren.length).toBeGreaterThanOrEqual(1);
        const root = commentsWithChildren[0];

        // Verify relationships
        expect(root.children).not.toBeNull();
        expect(root.children?.length).toBe(1);

        // Find the first level reply by its ID
        const firstLevelReply = await prisma.comment.findUnique({
            where: {
                id: reply1.id,
                storyId: testStory.id
            },
            include: {
                children: true
            }
        });

        if (!firstLevelReply) {
            throw new Error('First level reply not found');
        }

        expect(firstLevelReply.children).not.toBeNull();
        expect(Array.isArray(firstLevelReply.children));
        expect(firstLevelReply.children?.length).toBe(1);

        // Verify the second-level reply exists
        const secondLevelReply = firstLevelReply.children.find(c => c.id === reply2.id);
        expect(secondLevelReply).not.toBeNull();
    });
});