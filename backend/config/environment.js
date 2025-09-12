// Environment Configuration
module.exports = {
  // Database Configuration
  database: {
    server: process.env.DB_SERVER || 'psctech-rg.database.windows.net',
    database: process.env.DB_NAME || 'psctech_main',
    user: process.env.DB_USER || 'psctechadmin',
    password: process.env.DB_PASSWORD || 'Rluthando@12',
    options: {
      encrypt: true,
      trustServerCertificate: false,
      connectionTimeout: 30000,
      requestTimeout: 30000
    }
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development'
  },

  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'psctech-jwt-secret-key-2024',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  },

  // Voucher Configuration
  voucher: {
    denominations: [5, 10, 15, 20, 25, 30, 35, 40, 45],
    maxLearnerCount: 10,
    expiryDaysAfterRedemption: 30
  }
};


