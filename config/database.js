const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  multipleStatements: false
});

// Create promise-based connection pool
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test query to verify table exists
    const [rows] = await connection.execute('SHOW TABLES LIKE "urls"');
    if (rows.length > 0) {
      console.log('✅ URLs table exists');
    } else {
      console.log('⚠️  URLs table not found. Please run the SQL initialization script.');
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database connection
const initDatabase = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Failed to connect to database. Please check your configuration.');
    process.exit(1);
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await promisePool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Get connection from pool
const getConnection = async () => {
  try {
    return await promisePool.getConnection();
  } catch (error) {
    console.error('Failed to get database connection:', error.message);
    throw error;
  }
};

// Close all connections (for graceful shutdown)
const closeConnections = () => {
  pool.end(() => {
    console.log('📦 Database connection pool closed');
  });
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  initDatabase,
  executeQuery,
  getConnection,
  closeConnections
};
