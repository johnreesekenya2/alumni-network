import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use DATABASE_URL if available, otherwise construct from individual components
let connectionConfig;

// Detect if we're in production (Render, Heroku, etc.)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.HEROKU;

if (process.env.DATABASE_URL) {
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };
} else if (process.env.PGHOST || process.env.PGDATABASE || process.env.PGUSER) {
  connectionConfig = {
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    port: parseInt(process.env.PGPORT || '5432'),
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };
} else {
  // Default local PostgreSQL configuration
  connectionConfig = {
    host: 'localhost',
    database: 'postgres',
    user: 'postgres',
    password: '',
    port: 5432,
    ssl: false
  };
}

export const pool = new Pool(connectionConfig);

export const db = drizzle(pool, { schema });
