import { PrismaClient } from '@prisma/client'

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

  // Seed a story (link submission)
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

  // Seed an "ask" story (text-only submission)
  const askStory = await prisma.story.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'What is the best JavaScript framework in 2025?',
      url: null,
      points: 42,
      userId: user.id,
      text: "I'm evaluating different frameworks for my next project. React, Vue, Svelte, and Angular all have their strengths. What would you recommend based on your recent experience?",
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

  // Seed votes
  await prisma.vote.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      type: 'upvote',
      userId: user.id,
      storyId: story.id,
    },
  })

  await prisma.vote.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      type: 'downvote',
      userId: user.id,
      commentId: comment1.id,
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