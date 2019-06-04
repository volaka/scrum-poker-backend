import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const getClient = () => {
  // If production database has connection url then use this endpoint,
  // else you can delete it.
  if (process.env.DEBUG === undefined) return new Client({ connectionString });
  return new Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  });
};
