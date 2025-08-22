import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use DATABASE_URL if available, otherwise construct from individual components
let connectionConfig;

if (process.env.DATABASE_URL) {
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: false // Local PostgreSQL doesn't need SSL
  };
} else if (process.env.PGHOST || process.env.PGDATABASE || process.env.PGUSER) {
  connectionConfig = {
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    port: parseInt(process.env.PGPORT || '5432'),
    ssl: false
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
