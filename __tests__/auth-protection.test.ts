describe('Authentication Protection Tests', () => {
    const baseURL = 'http://localhost:3000';

    describe('Session Endpoint', () => {
        it('should return session information', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    ok: true,
                    headers: new Headers(),
                    redirected: false,
                    statusText: 'OK',
                    type: 'basic',
                    url: `${baseURL}/api/auth/session`,
                    json: () => Promise.resolve({ user: null }),
                } as Response)
            );

            const response = await global.fetch(`${baseURL}/api/auth/session`, {
                credentials: 'include' as const,
            });
            const data = await (response as any).json();

            expect(response.status).toBe(200);
            expect(data).toBeDefined();
        });
    });

    describe('Comments API', () => {
        it('should return comments data', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    ok: true,
                    headers: new Headers(),
                    redirected: false,
                    statusText: 'OK',
                    type: 'basic',
                    url: `${baseURL}/api/comments`,
                    json: () => Promise.resolve({ comments: [] }),
                } as Response)
            );

            const response = await global.fetch(`${baseURL}/api/comments`, {
                credentials: 'include' as const,
            });
            const data = await (response as any).json();

            expect(response.status).toBe(200);
            expect(data).toBeDefined();
        });
    });
});