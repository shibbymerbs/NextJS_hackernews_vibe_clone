# Hacker News Next.js Clone

A full-featured Hacker News clone built with Next.js 14, TypeScript, Tailwind CSS, and SQLite database.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS styling
- ✅ SQLite database with Prisma ORM
- ✅ User authentication system with GitHub OAuth
- ✅ Story listing and detail views
- ✅ Comment functionality with nested replies
- ✅ Upvote/downvote system for stories and comments
- ✅ Freshness-based sorting algorithm
- ✅ Ask HN page for submitting new posts
- ✅ Show HN page for filtering submissions
- ✅ User profile pages
- ✅ Responsive design
- ✅ API routes for data access
- ✅ Comprehensive Jest test suite

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Database Commands

```bash
# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Generate Prisma client
npm run db:generate

# Open Prisma Studio (database GUI)
npm run db:studio
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── styles/           # CSS files
│   └── types/            # TypeScript types
├── public/               # Static assets
├── prisma/               # Database schema and migrations
└── package.json          # Project configuration
```

## Database Setup

This project uses SQLite with Prisma ORM for data storage.

### Database Configuration

The database is configured to use SQLite with the following setup:

- **Database File**: `prisma/dev.db`
- **Schema**: Defined in `prisma/schema.prisma`
- **Models**: User, Story, and Comment with proper relationships

### Running Migrations

To set up the database:

```bash
npx prisma migrate dev --name init
```

### Seeding the Database

To populate the database with initial data:

```bash
npx ts-node prisma/seed.ts
```

### Database Models

- **User**: Stores user information with authentication support
- **Story**: Contains story posts with title, content, and metadata
- **Comment**: Handles nested comments with parent-child relationships

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database configuration (SQLite)
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

## Deployment

This project is configured for easy deployment on Vercel:

```bash
vercel
```

## Testing

This project uses Jest as the testing framework with TypeScript support.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes the following coverage:

- **File Existence Tests**: Verifies critical application files are present
- **API Endpoint Tests**: Tests for stories, comments, freshness endpoints, and votes
- **Database Setup Tests**: Validates database migrations and schema
- **Freshness Algorithm Tests**: Ensures proper story ranking calculations
- **Comment Creation Tests**: Validates comment submission functionality
- **Authentication Tests**: Tests for OAuth integration and session management
- **Nested Comments Tests**: Validates recursive comment rendering

### Test Structure

Tests are organized in the `__tests__` directory:

```
__tests__
├── ask.test.ts                     # File existence checks
├── auth-protection.test.ts          # Authentication protection tests
├── auth-with-cookie.test.ts         # Cookie-based authentication tests
├── comment-creation.test.ts         # API endpoint tests for comments
├── cookie-auth-final.test.ts        # Final cookie authentication tests
├── cookie-auth-simple.test.ts       # Simple cookie authentication tests
├── cookie-auth.test.ts              # Cookie authentication tests
├── freshness.test.ts                # Freshness algorithm tests
├── nested-comments-e2e.test.ts      # End-to-end nested comments tests
├── nested-comments-ui.test.ts       # UI rendering tests for nested comments
├── nested-comments.test.ts          # Unit tests for nested comments
├── setup.test.ts                    # Database setup and migration tests
└── verify.test.ts                   # Schema verification tests
```

## License

MIT

## Changelog

### Recent Updates

- **User Profile Pages**: Added user profile pages to view user information and activity
- **GitHub OAuth**: Implemented GitHub OAuth authentication for user login
- **Nested Comments**: Added support for recursive nested comment threads with visual depth indicators
- **Voting System**: Implemented upvote/downvote functionality for both stories and comments
- **Freshness Sorting**: Added algorithm to sort stories by freshness (time + score)
- **Ask HN Page**: Created a dedicated page for submitting new posts
- **Show HN Page**: Added filtering capability to show only submissions
- **Jest Testing**: Migrated from custom test scripts to comprehensive Jest test suite
- **TypeScript Improvements**: Strongly typed API routes and utility functions
- **Header Component**: Refactored navigation into a reusable Header component

### Database Schema Updates

The database schema has evolved with the following migrations:

1. Initial setup with User, Story, and Comment models
2. Added Votes model for tracking user votes
3. Extended Votes to support comments
4. Added ShowHN model for filtering submissions
5. Updated Comment relations for proper nesting
6. Added Auth-related models (Session, Account, VerificationToken)