# GitHub OAuth Setup Instructions

## Step 1: Create a GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" in the left sidebar
3. Click "New OAuth App"
4. Fill in the application details:
   - **Application name**: Hacker News Clone (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for local development)
   - **Application description**: Optional description of your app
5. For the **Authorization callback URL**, enter:
   ```
   http://localhost:3000/api/auth/callback/github
   ```

## Step 2: Get Your Credentials

After creating the OAuth app, GitHub will display:
- **Client ID** (copy this value)
- **Client Secret** (click "Generate new client secret" and copy it)

## Step 3: Update .env File

Edit the `.env` file in your project root and replace the placeholder values:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## Step 4: Restart Your Development Server

After updating the `.env` file, restart your Next.js development server:

```bash
npm run dev
```

## Step 5: Test the Authentication Flow

1. Visit `http://localhost:3000/login` in your browser
2. Click "Sign in with GitHub"
3. You should be redirected to GitHub's login page
4. After authenticating, you'll be redirected back to your app
5. The Header should now show your username and a logout button

## Troubleshooting

**If you get an error about callback URL mismatch:**
- Make sure the callback URL in your GitHub OAuth app settings matches exactly: `http://localhost:3000/api/auth/callback/github`
- Ensure there are no trailing slashes

**If authentication fails:**
- Verify that both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correctly set in `.env`
- Check that your development server is running on port 3000
- Clear your browser cache and try again

## Production Deployment

When deploying to production, you'll need to:
1. Update the Homepage URL and Callback URL in GitHub OAuth app settings to your production domain
2. Update the `GITHUB_CALLBACK_URL` in your `.env` file to match your production domain
3. Use HTTPS for all URLs in production