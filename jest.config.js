const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    globalSetup: '<rootDir>/jest.setup.js',
    globalTeardown: '<rootDir>/jest.setup.js',
    testEnvironment: 'node',
    preset: 'ts-jest',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.spec.ts'
    ],
    coveragePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/out/'
    ]
};

module.exports = createJestConfig(customJestConfig);