async function testAuthWithCookie() {
    console.log('Testing authentication with simulated session cookie...')

    try {
        // Test 1: Check if we can get session info
        const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
            credentials: 'include'
        })
        const sessionData = await sessionResponse.json()
        console.log('Session endpoint response:', JSON.stringify(sessionData, null, 2))

        // Test 2: Try to post a comment (should work if authenticated)
        const commentsResponse = await fetch(
            'http://localhost:3000/api/comments',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ storyId: 'test123', content: 'Test comment' }),
                credentials: 'include'
            }
        )
        const commentsData = await commentsResponse.json()
        console.log('Comments endpoint response:', JSON.stringify(commentsData, null, 2))
    } catch (error) {
        console.error('Error:', error.message)
    }
}

testAuthWithCookie()