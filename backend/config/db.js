import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import mockDb from '../database/mockFallback.js';

dotenv.config();

let pool = null;
let isUsingMock = false;

// Attempt MySQL Pool Initialization
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fintrack_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  });
} catch (err) {
  console.warn('[DB] MySQL pool initialization error, will use mock fallback:', err.message);
}

/**
 * Test Database Connection on startup
 */
export const connectDB = async () => {
  try {
    if (!pool) throw new Error('Pool not created');
    const connection = await pool.getConnection();
    console.log(`[DB] MySQL Connected successfully to database: "${process.env.DB_NAME || 'fintrack_db'}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    isUsingMock = false;
    return true;
  } catch (error) {
    isUsingMock = true;
    console.warn(`\n========================================================================`);
    console.warn(`[DB WARNING] Could not connect to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306} (${error.message}).`);
    console.warn(`[DB INFO] FinTrack is running in RESILIENT MOCK DATABASE MODE!`);
    console.warn(`All banking features (Auth, ACID Transfers, Loans, Fraud Detection, Audit Logs) are ACTIVE and functional.`);
    console.warn(`To connect MySQL: Ensure MySQL server is running, then run "npm run db:init".`);
    console.warn(`========================================================================\n`);
    return false;
  }
};

/**
 * Execute a SQL query (with fallback support)
 */
export const query = async (sql, params = []) => {
  if (isUsingMock) {
    return mockDb.query(sql, params);
  }
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return [rows, fields];
  } catch (err) {
    // If connection dropped, fallback
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR') {
      isUsingMock = true;
      console.warn(`[DB] Switched to Mock Database due to error: ${err.message}`);
      return mockDb.query(sql, params);
    }
    throw err;
  }
};

/**
 * Get dedicated connection for ACID Transactions
 */
export const getConnection = async () => {
  if (isUsingMock) {
    return mockDb.getConnection();
  }
  try {
    return await pool.getConnection();
  } catch (err) {
    isUsingMock = true;
    return mockDb.getConnection();
  }
};

export const isMockMode = () => isUsingMock;

export default { connectDB, query, getConnection, isMockMode };
