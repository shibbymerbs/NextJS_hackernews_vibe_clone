import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Database Setup', () => {
    it('should create database schema successfully', () => {
        // Run Prisma migrate
        const result = execSync('npx prisma migrate dev --name init', {
            cwd: process.cwd(),
            encoding: 'utf-8'
        });

        expect(result).toMatch(/(Migration applied successfully|Already in sync)/);
    });

    it('should seed database with initial data', () => {
        // Run Prisma seed (skip if already seeded)
        try {
            const result = execSync('npx prisma db seed', {
                cwd: process.cwd(),
                encoding: 'utf-8'
            });
            expect(result).toContain('Database seeded');
        } catch (error) {
            // It's okay if seeding fails because data is already there
            if (error instanceof Error) {
                expect(error.message).toContain('already seeded');
            }
        }
    });

    it('should have valid schema.prisma file', () => {
        const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
        expect(fs.existsSync(schemaPath)).toBe(true);

        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        expect(schemaContent).toContain('model Story');
        expect(schemaContent).toContain('model Comment');
        expect(schemaContent).toContain('model Vote');
    });
});