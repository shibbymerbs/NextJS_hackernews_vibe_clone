async function testCommentCreation() {
    const API_URL = 'http://localhost:3000/api/comments';

    // Test 1: Create a comment with valid story ID
    console.log('Test 1: Creating comment with valid story ID...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storyId: 'test-story-123',
                userId: null,
                text: 'This is a test comment',
                parentId: null
            })
        });
        const data = await response.json();
        console.log('✓ Status:', response.status);
        if (!response.ok) {
            console.log('  Error:', data.error || data.message);
        } else {
            console.log('  Success:', data.id ? 'Comment created' : 'No ID returned');
        }
    } catch (error) {
        console.log('✗ Error:', error.message);
    }

    // Test 2: Create a comment with invalid story ID
    console.log('\nTest 2: Creating comment with invalid story ID...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storyId: 'invalid-story-id-12345',
                userId: null,
                text: 'This should fail validation',
                parentId: null
            })
        });
        const data = await response.json();
        console.log('✓ Status:', response.status);
        if (!response.ok) {
            console.log('  Expected error:', data.error || data.message);
        } else {
            console.log('  Unexpected success');
        }
    } catch (error) {
        console.log('✗ Error:', error.message);
    }

    // Test 3: Create a comment with valid parent ID
    console.log('\nTest 3: Creating comment with valid parent ID...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storyId: 'test-story-123',
                userId: null,
                text: 'This is a reply to another comment',
                parentId: 'test-parent-comment-456'
            })
        });
        const data = await response.json();
        console.log('✓ Status:', response.status);
        if (!response.ok) {
            console.log('  Error:', data.error || data.message);
        } else {
            console.log('  Success:', data.id ? 'Comment created' : 'No ID returned');
        }
    } catch (error) {
        console.log('✗ Error:', error.message);
    }

    // Test 4: Create a comment with invalid parent ID
    console.log('\nTest 4: Creating comment with invalid parent ID...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storyId: 'test-story-123',
                userId: null,
                text: 'This should fail validation for parent',
                parentId: 'invalid-parent-id-12345'
            })
        });
        const data = await response.json();
        console.log('✓ Status:', response.status);
        if (!response.ok) {
            console.log('  Expected error:', data.error || data.message);
        } else {
            console.log('  Unexpected success');
        }
    } catch (error) {
        console.log('✗ Error:', error.message);
    }

    // Test 5: Create a comment with valid parent ID but invalid story ID
    console.log('\nTest 5: Creating comment with valid parent but invalid story...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storyId: 'invalid-story-id-12345',
                userId: null,
                text: 'This should fail validation for story',
                parentId: 'test-parent-comment-456'
            })
        });
        const data = await response.json();
        console.log('✓ Status:', response.status);
        if (!response.ok) {
            console.log('  Expected error:', data.error || data.message);
        } else {
            console.log('  Unexpected success');
        }
    } catch (error) {
        console.log('✗ Error:', error.message);
    }

    console.log('\nAll tests completed!');
}

testCommentCreation();