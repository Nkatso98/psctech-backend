import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.TEST_DATABASE = 'psctech_test';
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
});

// Database connection for testing
export const createTestDatabase = () => ({
  type: 'mssql',
  host: 'psctech-rg.database.windows.net',
  port: 1433,
  username: 'psctechadmin',
  password: 'Rluthando@12',
  database: 'psctech_test',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  entities: ['../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
  dropSchema: true, // Clean database for each test run
});


