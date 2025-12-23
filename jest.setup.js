const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let testDbConnected = false;

module.exports = async () => {
    // Connect to database for integration tests
    if (!testDbConnected) {
        await prisma.$connect();
        testDbConnected = true;
        console.log('✓ Connected to database for tests');
    }

    // Cleanup function for after all tests
    global.cleanup = async () => {
        try {
            // Delete test data created during tests
            await prisma.vote.deleteMany({
                where: {
                    OR: [
                        { storyId: { contains: 'test-story' } },
                        { commentId: { contains: 'test-comment' } }
                    ]
                }
            });

            await prisma.comment.deleteMany({
                where: {
                    id: { contains: 'test-comment' }
                }
            });

            await prisma.story.deleteMany({
                where: {
                    id: { contains: 'test-story' }
                }
            });
        } catch (error) {
            // Ignore errors if tables don't exist or no data to delete
            console.log('✓ Cleanup completed (some errors expected if no test data)');
        }

        await prisma.$disconnect();
    };
};

// Handle global teardown when called directly
if (process.env.JEST_GLOBAL_TEARDOWN) {
    module.exports.cleanup();
}

// Export for use in tests
module.exports.prisma = prisma;