const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestData() {
    console.log('Setting up test data...');

    // Create a test story
    const story = await prisma.story.create({
        data: {
            id: 'test-story-123',
            title: 'Test Story for Comments',
            url: 'https://example.com/test',
            text: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
    console.log('✓ Created test story:', story.id);

    // Create a parent comment
    const parentComment = await prisma.comment.create({
        data: {
            id: 'test-parent-comment-456',
            text: 'Parent comment for testing replies',
            createdAt: new Date(),
            updatedAt: new Date(),
            storyId: 'test-story-123'
        }
    });
    console.log('✓ Created parent comment:', parentComment.id);

    // Create a child comment (reply to parent)
    const childComment = await prisma.comment.create({
        data: {
            id: 'test-child-comment-789',
            text: 'Child comment replying to parent',
            createdAt: new Date(),
            updatedAt: new Date(),
            storyId: 'test-story-123',
            parentId: 'test-parent-comment-456'
        }
    });
    console.log('✓ Created child comment:', childComment.id);

    console.log('\nTest data setup complete!');
}

setupTestData()
    .catch(e => {
        console.error('Error setting up test data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });