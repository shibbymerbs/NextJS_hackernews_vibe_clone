import { prisma } from '../jest.setup';

describe('Nested Comments End-to-End', () => {
    let testUser: any;
    let testStory: any;
    let userCreationTimestamp: number;

    beforeAll(async () => {
        // Create a test user with unique email based on timestamp
        const timestamp = Date.now();
        testUser = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `test-${timestamp}@example.com`
            }
        });

        // Store the email for cleanup
        const testEmail = `test-${timestamp}@example.com`;
        // Store timestamp for cleanup
        userCreationTimestamp = timestamp;

        // Create a test story
        testStory = await prisma.story.create({
            data: {
                title: 'Test Story for Nested Comments E2E',
                url: 'https://example.com/test-e2e',
                text: 'Testing end-to-end nested comment functionality'
            }
        });
    });

    afterAll(async () => {
        // Clean up
        await prisma.comment.deleteMany({ where: { storyId: testStory.id } });
        await prisma.story.delete({ where: { id: testStory.id } });
        await prisma.user.delete({ where: { email: `test-${userCreationTimestamp}@example.com` } });

        await prisma.$disconnect();
    });

    it('should create root-level comment', async () => {
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        expect(rootComment.text).toBe('Root level comment');
    });

    it('should create nested reply (first level)', async () => {
        // First create a root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        // Then create the first-level reply
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id
            }
        });

        expect(reply1.parentId).toBe(rootComment.id);
    });

    it('should create deeply nested reply (second level)', async () => {
        // Create root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        // Create first-level reply
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id
            }
        });

        // Create second-level reply
        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: reply1.id
            }
        });

        expect(reply2.parentId).toBe(reply1.id);
    });

    it('should verify the complete hierarchy structure', async () => {
        // Create root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        // Create first-level reply
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id
            }
        });

        // Create second-level reply
        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: reply1.id
            }
        });

        // Verify the complete hierarchy
        const rootWithHierarchy = await prisma.comment.findUnique({
            where: { id: rootComment.id },
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            }
        });

        expect(rootWithHierarchy).not.toBeNull();
        expect(rootWithHierarchy?.children.length).toBe(1);
        expect(rootWithHierarchy?.children[0]?.id).toBe(reply1.id);
        expect(rootWithHierarchy?.children[0]?.children?.length).toBe(1);
        expect(rootWithHierarchy?.children[0]?.children?.[0].id).toBe(reply2.id);

        // Calculate total comments in tree
        const totalComments = 1 + // root
            (rootWithHierarchy!.children.length || 0) +
            (rootWithHierarchy!.children[0]?.children?.length || 0);
        expect(totalComments).toBe(3);
    });

    it('should verify parent-child relationships', async () => {
        // Create comments
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id
            }
        });

        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: reply1.id
            }
        });

        // Verify parent-child relationships
        const reply1WithParent = await prisma.comment.findUnique({
            where: { id: reply1.id },
            include: { parent: true }
        });

        expect(reply1WithParent?.parent?.id).toBe(rootComment.id);

        const reply2WithParent = await prisma.comment.findUnique({
            where: { id: reply2.id },
            include: { parent: true }
        });

        expect(reply2WithParent?.parent?.id).toBe(reply1.id);
    });
});