const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNestedComments() {
    try {
        // Create a test user
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com'
            }
        });

        console.log(`Created test user with ID: ${user.id}`);

        // Create a test story
        const story = await prisma.story.create({
            data: {
                title: 'Test Story for Nested Comments',
                url: 'https://example.com/test',
                text: 'Testing nested comment functionality'
            }
        });

        console.log(`Created test story with ID: ${story.id}`);

        // Create a root-level comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: user.id,
                storyId: story.id
            }
        });

        console.log(`Created root comment with ID: ${rootComment.id}`);

        // Create a reply to the root comment (nested comment)
        const nestedComment = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: user.id,
                storyId: story.id,
                parentId: rootComment.id
            }
        });

        console.log(`Created nested comment with ID: ${nestedComment.id}`);

        // Verify the relationship
        const commentWithChildren = await prisma.comment.findUnique({
            where: { id: rootComment.id },
            include: { children: true }
        });

        console.log('\nRoot comment with children:');
        console.log(JSON.stringify(commentWithChildren, null, 2));

        if (commentWithChildren.children.length > 0) {
            console.log('\n✅ SUCCESS: Nested comments are working correctly!');
            console.log(`Root comment has ${commentWithChildren.children.length} child comment(s)`);
        } else {
            console.log('\n❌ FAILED: No child comments found');
        }

        // Clean up
        await prisma.comment.deleteMany({ where: { storyId: story.id } });
        await prisma.story.delete({ where: { id: story.id } });
        await prisma.user.delete({ where: { id: user.id } });

        console.log('\nCleaned up test data');

    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNestedComments();