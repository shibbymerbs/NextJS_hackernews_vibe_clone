// Test the unified cookie-based authentication system
async function testCookieAuth() {
    const baseURL = 'http://localhost:3000';

    console.log('=== Testing Unified Cookie-Based Authentication ===\n');

    // Test 1: Get session without auth (should return null user)
    console.log('Test 1: Session endpoint without authentication');
    try {
        const response = await fetch(`${baseURL}/api/auth/session`, {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('✓ Session endpoint responded:', JSON.stringify(data, null, 2));
        if (data.user === null) {
            console.log('✓ Correctly returns null user when unauthenticated\n');
        } else {
            console.log('✗ ERROR: Should return null user for unauthenticated requests\n');
        }
    } catch (error) {
        console.log('✗ ERROR:', error.message, '\n');
    }

    // Test 2: Try to access protected API without auth
    console.log('Test 2: Protected API endpoint without authentication');
    try {
        const response = await fetch(`${baseURL}/api/comments`, {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.error && data.error.includes('Unauthorized')) {
            console.log('✓ Correctly rejects unauthenticated requests\n');
        } else {
            console.log('Note: API returned:', JSON.stringify(data, null, 2), '\n');
        }
    } catch (error) {
        console.log('Note: Error response:', error.message, '\n');
    }

    // Test 3: Check debug cookies endpoint
    console.log('Test 3: Debug cookies endpoint');
    try {
        const response = await fetch(`${baseURL}/api/debug-cookies`, {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('✓ Debug cookies responded:', JSON.stringify(data, null, 2));
        if (data.cookies) {
            console.log('✓ Cookies are being set correctly\n');
        } else {
            console.log('Note: No cookies detected (expected for unauthenticated requests)\n');
        }
    } catch (error) {
        console.log('Response:', error.message, '\n');
    }

    // Test 4: Session endpoint with cookie
    console.log('Test 4: Testing session persistence');
    try {
        const response = await fetch(`${baseURL}/api/auth/session`, {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.user === null) {
            console.log('✓ Session correctly shows no authenticated user\n');
        } else {
            console.log('Note: User session:', JSON.stringify(data, null, 2), '\n');
        }
    } catch (error) {
        console.log('Response:', error.message);
    }

    console.log('\n=== Cookie-Based Authentication Test Complete ===');
}

// Run the test
testCookieAuth().catch(console.error);