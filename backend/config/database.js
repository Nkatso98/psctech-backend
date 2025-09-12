const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.AZURE_SQL_SERVER || 'psctech.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'psctech_db',
  user: process.env.AZURE_SQL_USER || 'CloudSA801dac72',
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: process.env.AZURE_SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.AZURE_SQL_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  }
};

let pool = null;

const getConnection = async () => {
  try {
    if (pool) {
      return pool;
    }
    
    pool = await sql.connect(dbConfig);
    console.log('Connected to Azure SQL Database');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

module.exports = {
  getConnection,
  closeConnection,
  sql
};


