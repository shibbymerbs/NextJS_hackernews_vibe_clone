const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyComments() {
    console.log('Verifying comments in database...');

    const comments = await prisma.comment.findMany({
        where: {
            text: {
                contains: 'test'
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log(`\nFound ${comments.length} test comments:\n`);

    comments.forEach((comment, index) => {
        console.log(`${index + 1}. ID: ${comment.id}`);
        console.log(`   Text: ${comment.text}`);
        console.log(`   Story ID: ${comment.storyId}`);
        console.log(`   Parent ID: ${comment.parentId || 'null'}`);
        console.log(`   Created at: ${comment.createdAt.toISOString()}\n`);
    });

    if (comments.length > 0) {
        console.log('✓ Comments successfully created in database!');
    } else {
        console.log('✗ No comments found');
    }
}

verifyComments()
    .catch(e => {
        console.error('Error verifying comments:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });