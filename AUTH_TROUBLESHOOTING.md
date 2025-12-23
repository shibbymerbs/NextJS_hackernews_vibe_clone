# GitHub OAuth Authentication Troubleshooting

## Issues Identified and Fixed

### 1. Missing Environment Variables
**Problem:** The `.env` file was missing required NextAuth configuration variables.
**Fix:** Added `NEXTAUTH_URL` and `NEXTAUTH_SECRET` to `.env` file.

### 2. Version Mismatch in Auth Configuration
**Problem:** The auth configuration (`src/auth.ts`) was using NextAuth v5 beta syntax (`GitHub()`) but the installed package was v4 (`next-auth@^4.24.13`).
**Fix:** Updated `src/auth.ts` to use NextAuth v4 syntax with `GitHubProvider`.

### 3. Missing Database Fields
**Problem:** The User model in `prisma/schema.prisma` was missing the `emailVerified` field required by OAuth.
**Fix:** Added `emailVerified DateTime?` field to the User model.

### 4. Missing Account and Session Models
**Problem:** The PrismaAdapter requires Account and Session models for OAuth integration.
**Fix:** Added Account and Session models with proper relations to the User model.

## Files Modified

1. **`.env`** - Added NEXTAUTH_URL and NEXTAUTH_SECRET
2. **`src/auth.ts`** - Fixed GitHub provider import (GitHubProvider instead of GitHub)
3. **`prisma/schema.prisma`** - Added emailVerified field, Account model, Session model, and proper relations

## Database Migration

Ran successful migration:
```bash
npx prisma migrate dev --name add_auth_models
```

## Next Steps for Testing

1. Visit `http://localhost:3000`
2. Click "Sign In" in the top-right corner
3. You should be redirected to GitHub's login page
4. After logging in with GitHub, you'll be redirected back to the app
5. The header should now show your username and a "Sign Out" link

## Common Issues to Check

- Verify all environment variables are set correctly in `.env`
- Ensure GitHub OAuth callback URL matches: `http://localhost:3000/api/auth/callback/github`
- Check browser console for JavaScript errors
- Review server logs for authentication-related errors