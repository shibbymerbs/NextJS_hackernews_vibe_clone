import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Verification', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have Story model with correct fields', async () => {
    // Check that Story table exists and has expected columns
    const story = await prisma.story.findMany({
      take: 1,
      select: {
        id: true,
        title: true,
        url: true,
        text: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      }
    });
    expect(story.length).toBeGreaterThan(0);
  });

  it('should have Comment model with correct fields', async () => {
    // Check that Comment table exists and has expected columns
    const comment = await prisma.comment.findMany({
      take: 1,
      select: {
        id: true,
        text: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        storyId: true,
        parentId: true,
        userId: true
      }
    });
    expect(comment.length).toBeGreaterThan(0);
  });

  it('should have Vote model with correct fields', async () => {
    // Check that Vote table exists and has expected columns
    const vote = await prisma.vote.findMany({
      take: 1,
      select: {
        id: true,
        type: true,
        createdAt: true,
        storyId: true,
        commentId: true,
        showHnId: true,
        userId: true
      }
    });
    expect(vote.length).toBeGreaterThan(0);
  });

  it('should have proper relationships between tables', async () => {
    // Check that comments reference stories by finding a comment with a valid storyId
    const comment = await prisma.comment.findFirst({
      where: { storyId: { not: null } },
      include: { story: true }
    });
    expect(comment).toBeDefined();
    expect(comment?.story).toBeDefined();

    // Check that votes reference stories and comments
    const vote = await prisma.vote.findFirst({
      where: {
        OR: [
          { storyId: { not: null } },
          { commentId: { not: null } }
        ]
      }
    });
    expect(vote).toBeDefined();
  });
});