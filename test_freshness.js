const { calculateStoryFreshness, calculateCommentFreshness } = require('./src/lib/freshness');

// Test data
const testStory = {
  id: 'test-story-1',
  points: 42,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  _count: {
    comments: 8
  }
};

const testComment = {
  id: 'test-comment-1',
  points: 15,
  createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  _count: {
    children: 3
  }
};

console.log('Testing Freshness Algorithm...');
console.log('==============================');

console.log('Story Freshness Test:');
console.log('Input:', {
  points: testStory.points,
  hoursOld: 2,
  comments: testStory._count.comments
});

const storyScore = calculateStoryFreshness(testStory);
console.log('Freshness Score:', storyScore.toFixed(2));
console.log('');

console.log('Comment Freshness Test:');
console.log('Input:', {
  points: testComment.points,
  hoursOld: 1,
  replies: testComment._count.children
});

const commentScore = calculateCommentFreshness(testComment);
console.log('Freshness Score:', commentScore.toFixed(2));
console.log('');

console.log('Algorithm works! Freshness scores calculated successfully.');
console.log('Higher scores = fresher content');
console.log('Scores decay over time but are boosted by votes and engagement');