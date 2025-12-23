const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function runTests() {
    console.log('🧪 Starting nested comments UI integration test...')

    try {
        // Create test user with unique email
        const timestamp = Date.now()
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `test${timestamp}@example.com`
            }
        })
        console.log(`✓ Created test user: ${user.id}`)

        // Create test story
        const story = await prisma.story.create({
            data: {
                title: 'Test Story for Nested Comments',
                text: 'This is a test story to verify nested comment functionality.',
                url: 'https://example.com/test',
                userId: user.id,
                points: 0
            }
        })
        console.log(`✓ Created test story: ${story.id}`)

        // Create root comment
        const rootComment = await prisma.comment.create({
            data: {
                text: 'Root level comment',
                userId: user.id,
                storyId: story.id,
                points: 0
            }
        })
        console.log(`✓ Created root comment: ${rootComment.id}`)

        // Create first-level reply (parentId set)
        const reply1 = await prisma.comment.create({
            data: {
                text: 'Reply to root comment',
                userId: user.id,
                storyId: story.id,
                parentId: rootComment.id,  // This is the key for nested comments
                points: 0
            }
        })
        console.log(`✓ Created first-level reply: ${reply1.id}`)

        // Create second-level reply (parentId set to reply1)
        const reply2 = await prisma.comment.create({
            data: {
                text: 'Reply to first-level reply',
                userId: user.id,
                storyId: story.id,
                parentId: reply1.id,  // Nested reply
                points: 0
            }
        })
        console.log(`✓ Created second-level reply: ${reply2.id}`)

        // Verify the hierarchy is correct
        const commentsWithChildren = await prisma.comment.findMany({
            where: {
                storyId: story.id,
                parentId: null  // Only root comments
            },
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            }
        })

        console.log('\n📊 Comment hierarchy structure:')
        console.log(JSON.stringify(commentsWithChildren, null, 2))

        // Verify relationships
        const root = commentsWithChildren[0]
        if (root.children && root.children.length === 1 && root.children[0].id === reply1.id) {
            console.log('✓ Root comment has correct first-level child')
        } else {
            throw new Error('Root comment hierarchy is incorrect')
        }

        const firstLevelReply = root.children.find(c => c.id === reply1.id)
        if (firstLevelReply && firstLevelReply.children && firstLevelReply.children.length === 1 && firstLevelReply.children[0].id === reply2.id) {
            console.log('✓ First-level reply has correct second-level child')
        } else {
            throw new Error('First-level reply hierarchy is incorrect')
        }

        // Clean up
        await prisma.comment.deleteMany({
            where: { storyId: story.id }
        })
        await prisma.story.delete({
            where: { id: story.id }
        })
        await prisma.user.delete({
            where: { id: user.id }
        })

        console.log('\n✓ Cleaned up test data')

        console.log('\n🎉 SUCCESS: All nested comment UI integration tests passed!')
        console.log('   - Root comments work correctly')
        console.log('   - First-level replies work correctly')
        console.log('   - Second-level replies work correctly')
        console.log('   - Parent-child relationships are maintained')

    } catch (error) {
        console.error('\n❌ FAILED:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

runTests()