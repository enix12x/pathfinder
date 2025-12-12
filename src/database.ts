import mysql from 'mysql2/promise';
import axios from 'axios';
import { loadConfig } from './config';

let pool: mysql.Pool | null = null;
let dbConfig: {
  host: string;
  user: string;
  password: string;
  database: string;
} | null = null;

async function getDatabaseConfig() {
  if (!dbConfig) {
    const config = loadConfig();
    if (!config.auth.enabled) {
      throw new Error('Database not available - auth is disabled');
    }
    
    try {
      const response = await axios.get(`${config.auth.authServerUrl}/api/config/database`);
      dbConfig = response.data;
    } catch (error: any) {
      throw new Error(`Failed to get database config from auth server: ${error.message}`);
    }
  }
  return dbConfig;
}

export async function getPool(): Promise<mysql.Pool> {
  if (!pool) {
    const config = await getDatabaseConfig();
    if (!config) {
      throw new Error('Failed to get database configuration');
    }
    pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}
