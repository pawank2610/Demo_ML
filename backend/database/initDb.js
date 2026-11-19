import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('[INIT DB] Connecting to MySQL server...');
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT) || 3306;
  const dbName = process.env.DB_NAME || 'fintrack_db';

  try {
    // 1. Connect without database to create if not exists
    const rootConn = await mysql.createConnection({ host, user, password, port, multipleStatements: true });
    console.log(`[INIT DB] Creating database '${dbName}' if not exists...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConn.end();

    // 2. Connect to the database and run schema.sql
    const conn = await mysql.createConnection({ host, user, password, port, database: dbName, multipleStatements: true });
    
    console.log('[INIT DB] Applying schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Split on DELIMITER or run statements
    // We clean delimiters for Node execution
    const cleanSchema = schemaSql
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .replace(/\$\$/g, ';');

    await conn.query(cleanSchema);
    console.log('[INIT DB] Tables, views, and triggers created successfully.');

    // 3. Apply seed data
    console.log('[INIT DB] Applying seed.sql mock data...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await conn.query(seedSql);
    console.log('[INIT DB] Database seeded successfully with demo users, accounts, and loans.');

    await conn.end();
    console.log('\n[SUCCESS] fintrack_db is ready to go!\n');
  } catch (error) {
    console.error('[INIT DB ERROR]', error.message);
    process.exit(1);
  }
}

initDatabase();

