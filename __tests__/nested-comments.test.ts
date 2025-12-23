import { prisma } from '../jest.setup';

describe('Nested Comments', () => {
    let testUser: any;
    let testStory: any;
    let testEmail: string;

    beforeAll(async () => {
        // Create test user with unique email to avoid conflicts
        const timestamp = Date.now();
        testEmail = `test-${timestamp}@example.com`;
        testUser = await prisma.user.create({
            data: {
                name: 'Test User',
                email: testEmail
            }
        });

        testStory = await prisma.story.create({
            data: {
                title: 'Test Story for Nested Comments',
                url: 'https://example.com/test',
                text: 'Testing nested comment functionality'
            }
        });
    });

    afterAll(async () => {
        // Clean up test data
        const timestamp = Date.now();
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

    it('should create a root-level comment', async () => {
        const result = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        expect(result.text).toBe('Root level comment');
        expect(result.storyId).toBe(testStory.id);
    });

    it('should create a nested reply to root comment', async () => {
        // First create a root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        // Then create a nested reply
        const nestedComment = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id
            }
        });

        expect(nestedComment.text).toBe('Reply to root comment');
        expect(nestedComment.parentId).toBe(rootComment.id);
    });

    it('should verify parent-child relationship', async () => {
        // Create a root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: testUser.id,
                storyId: testStory.id
            }
        });

        // Create a nested reply
        const nestedComment = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: testUser.id,
                storyId: testStory.id,
                parentId: rootComment.id
            }
        });

        // Verify the relationship using include
        const commentWithChildren = await prisma.comment.findUnique({
            where: { id: rootComment.id },
            include: { children: true }
        });

        expect(commentWithChildren).not.toBeNull();
        expect(commentWithChildren?.children.length).toBe(1);
        expect(commentWithChildren?.children[0].id).toBe(nestedComment.id);
    });
});