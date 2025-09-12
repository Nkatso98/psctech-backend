import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mssql',
  host: 'psctech-rg.database.windows.net',
  port: 1433,
  username: 'psctechadmin',
  password: 'Rluthando@12',
  database: 'psctech_master', // Master database for tenant management
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  entities: [
    'dist/**/*.entity{.ts,.js}',
    'src/**/*.entity{.ts,.js}'
  ],
  migrations: [
    'dist/migrations/*{.ts,.js}',
    'src/migrations/*{.ts,.js}'
  ],
  synchronize: false, // Set to false in production
  logging: ['error', 'warn', 'query'],
  extra: {
    max: 20, // Maximum number of connections
    min: 5,  // Minimum number of connections
    acquire: 30000,
    idle: 10000,
  }
};

// Configuration for individual institution databases
export const getInstitutionDatabaseConfig = (databaseName: string): TypeOrmModuleOptions => ({
  type: 'mssql',
  host: 'psctech-rg.database.windows.net',
  port: 1433,
  username: 'psctechadmin',
  password: 'Rluthando@12',
  database: databaseName,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  entities: [
    'dist/**/*.entity{.ts,.js}',
    'src/**/*.entity{.ts,.js}'
  ],
  synchronize: false,
  logging: ['error', 'warn'],
  extra: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  }
});

// Environment-specific configurations
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...databaseConfig,
        logging: ['error'], // Only log errors in production
        synchronize: false,
      };
    case 'test':
      return {
        ...databaseConfig,
        database: 'psctech_test',
        logging: false,
        synchronize: true,
      };
    default:
      return {
        ...databaseConfig,
        database: 'psctech_dev',
        synchronize: true,
      };
  }
};


