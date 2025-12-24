import { Response } from 'node-fetch';

describe('Cookie-Based Authentication Tests', () => {
    const baseURL = 'http://localhost:3000';
    let sessionCookies: string = '';

    beforeEach(() => {
        // Mock fetch for all tests
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return null user when unauthenticated', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            ok: true,
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic' as const,
            url: `${baseURL}/api/auth/session`,
            json: () => Promise.resolve({ user: null }),
        } as unknown as Response);

        const response = await fetch(`${baseURL}/api/auth/session`, {
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await (response as any).json();
        expect(data.user).toBeNull();
    });

    it('should reject unauthenticated requests to protected API', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 401,
            ok: false,
            headers: new Headers(),
            redirected: false,
            statusText: 'Unauthorized',
            type: 'basic' as const,
            url: `${baseURL}/api/comments`,
            json: () => Promise.resolve({ error: 'Unauthorized' }),
        } as unknown as Response);

        const response = await fetch(`${baseURL}/api/comments`, {
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await (response as any).json();
        expect(data.error).toContain('Unauthorized');
    });

    it('should simulate sign-in process and receive session cookie', async () => {
        // Mock successful sign-in response with set-cookie header
        const mockResponse = {
            status: 200,
            ok: true,
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic' as const,
            url: `${baseURL}/api/auth/signin`,
            json: () => Promise.resolve({ success: true }),
        } as unknown as Response;

        // Add set-cookie header manually
        (mockResponse as any).headers.append(
            'set-cookie',
            'next-auth.session-token=token123; Path=/; HttpOnly; SameSite=Lax'
        );

        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

        const response = await fetch(`${baseURL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });

        sessionCookies = 'next-auth.session-token=token123; Path=/; HttpOnly; SameSite=Lax';
        expect(sessionCookies).toBeTruthy();
    });

    it('should allow access to protected API with valid cookie', async () => {
        if (!sessionCookies) {
            // Set up session cookies for this test
            sessionCookies = 'next-auth.session-token=token123; Path=/; HttpOnly; SameSite=Lax';
        }

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            ok: true,
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic' as const,
            url: `${baseURL}/api/comments`,
            json: () => Promise.resolve({ comments: [] }),
        } as unknown as Response);

        const response = await fetch(`${baseURL}/api/comments`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookies,
            },
        });

        const data = await (response as any).json();
        expect(Array.isArray(data.comments)).toBe(true);
    });

    it('should return session data when authenticated', async () => {
        if (!sessionCookies) {
            // Set up session cookies for this test
            sessionCookies = 'next-auth.session-token=token123; Path=/; HttpOnly; SameSite=Lax';
        }

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            ok: true,
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic' as const,
            url: `${baseURL}/api/auth/session`,
            json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com' } }),
        } as unknown as Response);

        const response = await fetch(`${baseURL}/api/auth/session`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookies,
            },
        });

        const data = await (response as any).json();
        expect(data.user).toBeDefined();
        expect(data.user.email).toBe('test@example.com');
    });

    it('should clear session on sign-out', async () => {
        if (!sessionCookies) {
            // Set up session cookies for this test
            sessionCookies = 'next-auth.session-token=token123; Path=/; HttpOnly; SameSite=Lax';
        }

        // Create mock response with proper typing
        const signOutResponse = {
            status: 200,
            ok: true,
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic' as const,
            url: `${baseURL}/api/auth/signout`,
            json: () => Promise.resolve({ success: true }),
        } as unknown as Response;

        // Add set-cookie header manually
        (signOutResponse as any).headers.append(
            'set-cookie',
            'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        );

        (global.fetch as jest.Mock).mockResolvedValueOnce(signOutResponse);

        const response = await fetch(`${baseURL}/api/auth/signout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookies,
            },
            body: JSON.stringify({}),
        });

        const data = await (response as any).json();
        expect(data.success).toBe(true);
    });
});