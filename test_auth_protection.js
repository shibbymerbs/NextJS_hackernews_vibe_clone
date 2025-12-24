// Simple test to verify authentication endpoints work
async function testAuth() {
    console.log('Testing authentication flow...');

    try {
        // Test 1: Check session endpoint
        console.log('\n1. Testing /api/auth/session endpoint...');
        const response = await fetch('http://localhost:3000/api/auth/session', {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('Session response:', JSON.stringify(data, null, 2));

        // Test 2: Check comments API
        console.log('\n2. Testing /api/comments endpoint...');
        const commentsResponse = await fetch('http://localhost:3000/api/comments', {
            credentials: 'include'
        });
        const commentsData = await commentsResponse.json();
        console.log('Comments response:', JSON.stringify(commentsData, null, 2));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAuth();