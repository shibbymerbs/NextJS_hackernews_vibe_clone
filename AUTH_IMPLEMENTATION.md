# GitHub OAuth Authentication Implementation

This document summarizes the implementation of GitHub OAuth authentication for the Hacker News clone application.

## What Was Implemented

### 1. Dependencies Added
- `next-auth@^5.0.0-beta.24` - NextAuth.js v5 beta for authentication
- `@auth/prisma-adapter@^2.7.0` - Prisma adapter for NextAuth.js

### 2. Authentication Configuration (`src/auth.ts`)
Created a comprehensive authentication configuration file that:
- Uses the PrismaAdapter to integrate with the existing database
- Configures GitHub OAuth provider (requires environment variables)
- Sets up session callbacks to include user ID in sessions
- Defines custom sign-in and sign-out pages

### 3. API Routes
Created two authentication API routes:
- `src/app/api/auth/[...nextauth]/route.ts` - Main authentication route handler
- `src/app/api/auth/signout/route.ts` - Custom signout route

### 4. Login Page (`src/app/login/page.tsx`)
Created a login page with:
- GitHub sign-in button
- Responsive design using Tailwind CSS
- Link to the home page

### 5. Updated Header Component (`src/components/Header.tsx`)
Enhanced the header to show authentication status:
- Displays "Sign In" link when user is not authenticated
- Shows username and "Sign Out" link when user is logged in
- Maintains all existing navigation links

### 6. Database Schema Updates (`prisma/schema.prisma`)
Updated the User model to support OAuth fields:
- Added `emailVerified` field (DateTime)
- Added `image` field (String)
- Updated relations for accounts and sessions

## Environment Variables Required

Add these to your `.env` file:

```env
# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_complex_secret_string_here
```

## How to Use

1. **Get GitHub OAuth Credentials:**
   - Go to https://github.com/settings/developers
   - Create a new OAuth App
   - Set callback URL to `http://localhost:3000/api/auth/callback/github`
   - Copy the Client ID and Client Secret

2. **Configure Environment Variables:**
   - Add the credentials to your `.env` file
   - Generate a secure secret (use `openssl rand -base64 32`)

3. **Run the Application:**
   ```bash
   npm run dev
   ```

4. **Test Authentication:**
   - Visit `http://localhost:3000`
   - Click "Sign In" in the header
   - You'll be redirected to GitHub for authentication
   - After successful login, you'll be redirected back to the app

## Files Modified/Created

### Created:
- `src/auth.ts` - Authentication configuration
- `src/app/login/page.tsx` - Login page component
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API route
- `src/app/api/auth/signout/route.ts` - Signout API route
- `AUTH_IMPLEMENTATION.md` - This document

### Modified:
- `package.json` - Added next-auth dependencies
- `prisma/schema.prisma` - Updated User model for OAuth support
- `src/components/Header.tsx` - Added auth status display

## Testing the Implementation

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign In" in the top-right corner
4. You should be redirected to GitHub's login page
5. After logging in with GitHub, you'll be redirected back to the app
6. The header should now show your username and a "Sign Out" link

## Troubleshooting

If authentication doesn't work:
1. Verify all environment variables are set correctly
2. Check that the GitHub OAuth callback URL matches your configuration
3. Ensure the NextAuth secret is complex and secure
4. Check browser console for errors
5. Review server logs for any authentication-related errors

## Security Considerations

- Always use HTTPS in production
- Keep your GitHub client secret secure
- Use a strong, random NEXTAUTH_SECRET
- Consider adding rate limiting to prevent brute force attacks
- Regularly review and update OAuth application settings on GitHub