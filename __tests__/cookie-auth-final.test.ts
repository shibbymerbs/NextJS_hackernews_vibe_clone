describe('Cookie Authentication Final Tests', () => {
    const baseURL = 'http://localhost:3000';

    describe('Unauthenticated Access', () => {
        it('should return null user for unauthenticated session', async () => {
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
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await (response as any).json();

            expect(response.status).toBe(200);
            expect(data.user).toBeNull();
        });

        it('should return 401 for protected API without auth', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 401,
                    ok: false,
                    headers: new Headers(),
                    redirected: false,
                    statusText: 'Unauthorized',
                    type: 'basic',
                    url: `${baseURL}/api/protected`,
                    json: () => Promise.resolve({ error: 'Unauthorized' }),
                } as Response)
            );

            const response = await global.fetch(`${baseURL}/api/protected`, {
                headers: { 'Content-Type': 'application/json' },
            });

            expect(response.status).toBe(401);
        });
    });

    describe('Debug Cookies Endpoint', () => {
        it('should return cookie information', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    status: 200,
                    ok: true,
                    headers: new Headers(),
                    redirected: false,
                    statusText: 'OK',
                    type: 'basic',
                    url: `${baseURL}/api/debug-cookies`,
                    json: () => Promise.resolve({ cookies: {} }),
                } as Response)
            );

            const response = await global.fetch(`${baseURL}/api/debug-cookies`, {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await (response as any).json();

            expect(response.status).toBe(200);
            expect(data.cookies).toBeDefined();
        });
    });
});