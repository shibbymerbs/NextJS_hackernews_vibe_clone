const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Seed a user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'username',
      email: 'user@example.com',
    },
  })

  // Seed a story
  const story = await prisma.story.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Example Story Title',
      url: 'https://example.com/story',
      points: 100,
      userId: user.id,
      text: 'This is the content of the example story. It demonstrates how a story detail page would look in a Hacker News clone application. The story includes a title, author information, score, and comments section.',
    },
  })

  // Seed comments
  const comment1 = await prisma.comment.upsert({
    where: { id: '101' },
    update: {},
    create: {
      id: '101',
      text: 'This is a great example story! Very informative.',
      userId: user.id,
      storyId: story.id,
    },
  })

  const comment2 = await prisma.comment.upsert({
    where: { id: '102' },
    update: {},
    create: {
      id: '102',
      text: 'I agree, the implementation looks clean and well-structured.',
      userId: user.id,
      storyId: story.id,
    },
  })

  const comment3 = await prisma.comment.upsert({
    where: { id: '103' },
    update: {},
    create: {
      id: '103',
      text: 'Thanks! I appreciate the feedback.',
      userId: user.id,
      storyId: story.id,
      parentId: comment2.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })