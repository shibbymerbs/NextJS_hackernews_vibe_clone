import { prisma } from '../jest.setup';

describe('Comment Creation', () => {
    let testStory: any;
    let testParentComment: any;

    beforeEach(async () => {
        // Create test stories and comments for testing
        testStory = await prisma.story.create({
            data: {
                title: 'Test Story',
                url: 'http://example.com/test'
            }
        });

        testParentComment = await prisma.comment.create({
            data: {
                text: 'Parent comment',
                storyId: testStory.id
            }
        });
    });

    afterEach(async () => {
        // Clean up test data created during tests
        await prisma.comment.deleteMany({
            where: {
                OR: [
                    { id: { contains: 'test-comment' } },
                    { id: { contains: 'invalid-parent-id' } }
                ]
            }
        });
    });

    afterAll(async () => {
        // Clean up test data created in beforeEach
        await prisma.comment.deleteMany({
            where: {
                id: testParentComment.id
            }
        });

        await prisma.story.deleteMany({
            where: {
                id: testStory.id
            }
        });

        await prisma.$disconnect();
    });

    it('should create a comment with valid story ID', async () => {
        const result = await prisma.comment.create({
            data: {
                text: 'This is a test comment',
                storyId: testStory.id
            }
        });

        expect(result.storyId).toBe(testStory.id);
    });

    it('should reject comment with invalid story ID', async () => {
        try {
            await prisma.comment.create({
                data: {
                    text: 'This should fail validation',
                    storyId: 'invalid-story-id-12345'
                }
            });
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            const err = error as Error;
            expect(err.message).toContain('Foreign key constraint failed');
        }
    });

    it('should create a comment with valid parent ID', async () => {
        const result = await prisma.comment.create({
            data: {
                text: 'This is a reply to another comment',
                storyId: testStory.id,
                parentId: testParentComment.id
            }
        });

        expect(result.parentId).toBe(testParentComment.id);
    });

    it('should reject comment with invalid parent ID', async () => {
        try {
            await prisma.comment.create({
                data: {
                    text: 'This should fail validation for parent',
                    storyId: testStory.id,
                    parentId: 'invalid-parent-id-12345'
                }
            });
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            const err = error as Error;
            expect(err.message).toContain('Foreign key constraint failed');
        }
    });
});