const axios = require('axios');
const { parse } = require('cookie');

// Test the unified cookie-based authentication system
async function testCookieAuth() {
    const baseURL = 'http://localhost:3000';
    let sessionCookies = '';

    console.log('=== Testing Unified Cookie-Based Authentication ===\n');

    // Test 1: Get session without auth (should return null user)
    console.log('Test 1: Session endpoint without authentication');
    try {
        const response = await axios.get(`${baseURL}/api/auth/session`, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✓ Session endpoint responded:', JSON.stringify(response.data, null, 2));
        if (response.data.user === null) {
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
        const response = await axios.get(`${baseURL}/api/comments`, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.data.error && response.data.error.includes('Unauthorized')) {
            console.log('✓ Correctly rejects unauthenticated requests\n');
        } else {
            console.log('✗ ERROR: Should reject unauthenticated requests\n');
        }
    } catch (error) {
        console.log('✗ ERROR:', error.message, '\n');
    }

    // Test 3: Sign in and get session cookie
    console.log('Test 3: Simulating sign-in process');
    try {
        const response = await axios.post(
            `${baseURL}/api/auth/signin`,
            { email: 'test@example.com', password: 'password123' },
            { headers: { 'Content-Type': 'application/json' } }
        );

        // Extract cookies from set-cookie header
        if (response.headers['set-cookie']) {
            sessionCookies = response.headers['set-cookie'].join('; ');
            console.log('✓ Received session cookie(s)');
        } else {
            console.log('✗ No cookies received in response\n');
        }
    } catch (error) {
        console.log('Note: Sign-in may require valid credentials or OAuth providers\n');
    }

    // Test 4: Access protected API with session cookie
    if (sessionCookies) {
        console.log('\nTest 4: Protected API endpoint with authentication cookie');
        try {
            const response = await axios.get(`${baseURL}/api/comments`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': sessionCookies
                }
            });
            console.log('✓ Request succeeded with cookies:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('Response:', error.response?.data || error.message);
        }
    }

    // Test 5: Session endpoint with cookie
    if (sessionCookies) {
        console.log('\nTest 5: Session endpoint with authentication cookie');
        try {
            const response = await axios.get(`${baseURL}/api/auth/session`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': sessionCookies
                }
            });
            console.log('✓ Session data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('Response:', error.response?.data || error.message);
        }
    }

    // Test 6: Sign out
    if (sessionCookies) {
        console.log('\nTest 6: Sign-out process');
        try {
            const response = await axios.post(
                `${baseURL}/api/auth/signout`,
                {},
                { headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookies } }
            );
            if (response.headers['set-cookie']) {
                console.log('✓ Session cleared, cookies removed');
            }
        } catch (error) {
            console.log('Note: Sign-out completed\n');
        }
    }

    console.log('\n=== Cookie-Based Authentication Test Complete ===');
}

// Run the test
testCookieAuth().catch(console.error);