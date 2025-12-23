const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNestedCommentsE2E() {
    try {
        console.log('🧪 Starting end-to-end nested comments test...\n');

        // Create a test user
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com'
            }
        });

        // Create a test story
        const story = await prisma.story.create({
            data: {
                title: 'Test Story for Nested Comments E2E',
                url: 'https://example.com/test-e2e',
                text: 'Testing end-to-end nested comment functionality'
            }
        });

        console.log(`✓ Created test user: ${user.id}`);
        console.log(`✓ Created test story: ${story.id}\n`);

        // Test 1: Create root-level comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: user.id,
                storyId: story.id
            }
        });

        console.log(`✓ Created root comment: ${rootComment.id}`);

        // Test 2: Create nested reply (first level)
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: user.id,
                storyId: story.id,
                parentId: rootComment.id
            }
        });

        console.log(`✓ Created first-level reply: ${reply1.id}`);

        // Test 3: Create deeply nested reply (second level)
        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: user.id,
                storyId: story.id,
                parentId: reply1.id
            }
        });

        console.log(`✓ Created second-level reply: ${reply2.id}\n`);

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

        console.log('📊 Comment hierarchy structure:');
        console.log(JSON.stringify(rootWithHierarchy, null, 2));
        console.log();

        // Validate the hierarchy
        let success = true;
        const expectedStructure = {
            rootCommentId: rootComment.id,
            firstLevelReplyCount: 1,
            secondLevelReplyCount: 1,
            totalCommentsInTree: 3
        };

        if (rootWithHierarchy.children.length !== expectedStructure.firstLevelReplyCount) {
            console.log(`❌ Expected ${expectedStructure.firstLevelReplyCount} first-level replies, got ${rootWithHierarchy.children.length}`);
            success = false;
        }

        if (rootWithHierarchy.children[0]?.children?.length !== expectedStructure.secondLevelReplyCount) {
            console.log(`❌ Expected ${expectedStructure.secondLevelReplyCount} second-level replies, got ${rootWithHierarchy.children[0]?.children?.length}`);
            success = false;
        }

        const totalComments = 1 + // root
            (rootWithHierarchy.children.length || 0) +
            (rootWithHierarchy.children[0]?.children?.length || 0);

        if (totalComments !== expectedStructure.totalCommentsInTree) {
            console.log(`❌ Expected ${expectedStructure.totalCommentsInTree} total comments, got ${totalComments}`);
            success = false;
        }

        // Test 4: Verify parent-child relationships
        const reply1WithParent = await prisma.comment.findUnique({
            where: { id: reply1.id },
            include: { parent: true }
        });

        if (reply1WithParent.parent?.id !== rootComment.id) {
            console.log(`❌ First-level reply's parent should be root comment, got ${reply1WithParent.parent?.id}`);
            success = false;
        }

        const reply2WithParent = await prisma.comment.findUnique({
            where: { id: reply2.id },
            include: { parent: true }
        });

        if (reply2WithParent.parent?.id !== reply1.id) {
            console.log(`❌ Second-level reply's parent should be first-level reply, got ${reply2WithParent.parent?.id}`);
            success = false;
        }

        // Clean up
        await prisma.comment.deleteMany({ where: { storyId: story.id } });
        await prisma.story.delete({ where: { id: story.id } });
        await prisma.user.delete({ where: { id: user.id } });

        console.log('\n✓ Cleaned up test data');

        if (success) {
            console.log('\n🎉 SUCCESS: All nested comment tests passed!');
            console.log('   - Root comments work correctly');
            console.log('   - First-level replies work correctly');
            console.log('   - Second-level replies work correctly');
            console.log('   - Parent-child relationships are maintained');
        } else {
            console.log('\n❌ FAILURE: Some tests failed');
        }

    } catch (error) {
        console.error('\n❌ Error during testing:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNestedCommentsE2E();