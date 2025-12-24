const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing authentication protection for Hacker News app...\n');

// Test 1: Check that API routes have proper authentication
console.log('Test 1: Checking API route authentication...');
const apiRoutes = [
    'src/app/api/votes/route.ts',
    'src/app/api/stories/route.ts',
    'src/app/api/comments/route.ts',
    'src/app/api/showhns/route.ts'
];

let allTestsPassed = true;

apiRoutes.forEach(route => {
    const content = fs.readFileSync(route, 'utf8');
    if (!content.includes('auth()') || !content.includes('session?.user?.id')) {
        console.log(`❌ ${route} - Missing authentication check`);
        allTestsPassed = false;
    } else {
        console.log(`✓ ${route} - Has proper authentication`);
    }
});

// Test 2: Check that frontend components use session
console.log('\nTest 2: Checking frontend component authentication...');
const components = [
    { path: 'src/components/VoteButtons.tsx', check: 'useSession' },
    { path: 'src/components/CommentVoteButtons.tsx', check: 'useSession' },
    { path: 'src/components/ShowHNVoteButtons.tsx', check: 'useSession' },
    { path: 'src/components/CommentForm.tsx', check: 'useSession' },
    { path: 'src/components/ShowHNForm.tsx', check: 'useSession' },
    { path: 'src/components/ReplyButton.tsx', check: 'useSession' }
];

components.forEach(component => {
    const content = fs.readFileSync(component.path, 'utf8');
    if (!content.includes(component.check)) {
        console.log(`❌ ${component.path} - Missing ${component.check}`);
        allTestsPassed = false;
    } else {
        console.log(`✓ ${component.path} - Uses ${component.check}`);
    }
});

// Test 3: Check that authentication errors redirect to login
console.log('\nTest 3: Checking authentication error handling...');
const filesWithLoginRedirect = [
    'src/components/CommentForm.tsx',
    'src/components/ShowHNForm.tsx'
];

filesWithLoginRedirect.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('/login')) {
        console.log(`❌ ${file} - Missing login redirect`);
        allTestsPassed = false;
    } else {
        console.log(`✓ ${file} - Has login redirect`);
    }
});

// Test 4: Check middleware configuration
console.log('\nTest 4: Checking middleware...');
const middlewarePath = 'src/middleware.ts';
if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    if (content.includes('withAuth') && content.includes('/api/')) {
        console.log(`✓ ${middlewarePath} - Protects API routes`);
    } else {
        console.log(`❌ ${middlewarePath} - Not properly configured`);
        allTestsPassed = false;
    }
}

// Test 5: Check auth configuration
console.log('\nTest 5: Checking auth configuration...');
const authPath = 'src/auth.ts';
if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    if (content.includes('GitHub') && content.includes('user.id')) {
        console.log(`✓ ${authPath} - Configured with GitHub and user.id`);
    } else {
        console.log(`❌ ${authPath} - Missing configuration`);
        allTestsPassed = false;
    }
}

console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
    console.log('✅ All authentication tests passed!');
    process.exit(0);
} else {
    console.log('❌ Some tests failed. Please review the output above.');
    process.exit(1);
}