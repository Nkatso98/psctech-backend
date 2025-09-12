import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
    '<rootDir>/test/**/*.spec.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  // Database test configuration
  testTimeout: 30000, // 30 seconds for database operations
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
  // Environment variables for testing
  setupFiles: ['<rootDir>/test/env.setup.ts'],
};

export default config;


