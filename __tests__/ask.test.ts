import fs from 'fs';
import path from 'path';

describe('Ask Feature Implementation', () => {
    it('should have /ask page at correct location', () => {
        const askPagePath = path.join(__dirname, '../src/app/ask/page.tsx');
        expect(fs.existsSync(askPagePath)).toBe(true);
    });

    it('should contain form and createStory function in ask page', () => {
        const askPage = fs.readFileSync(path.join(__dirname, '../src/app/ask/page.tsx'), 'utf8');
        expect(askPage).toContain('createStory');
        expect(askPage).toContain('form');
    });

    it('should have POST /api/stories endpoint with Prisma integration', () => {
        const apiRoute = fs.readFileSync(path.join(__dirname, '../src/app/api/stories/route.ts'), 'utf8');
        expect(apiRoute).toContain('POST');
        expect(apiRoute).toContain('prisma.story.create');
    });

    it('should have database schema supporting text-only stories', () => {
        const prismaSchema = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8');
        expect(prismaSchema).toContain('text');
        expect(prismaSchema).toMatch(/url\s+String\?/);
    });

    it('should have seed data with ask story example', () => {
        const seedData = fs.readFileSync(path.join(__dirname, '../prisma/seed.ts'), 'utf8');
        expect(seedData).toContain("What is the best JavaScript framework");
        expect(seedData).toMatch(/url:\s*null/);
    });

    it('should have stories utility with create function', () => {
        const storiesUtil = fs.readFileSync(path.join(__dirname, '../src/lib/stories.ts'), 'utf8');
        expect(storiesUtil).toContain('export async function createStory');
    });
});