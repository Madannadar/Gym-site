import { Client } from 'pg';

const db = new Client({
  user: process.env.DB_USER || 'your-db-user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'your-db-name',
  password: process.env.DB_PASSWORD || 'your-db-password',
  port: process.env.DB_PORT || 5432,
});

db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection error', err.stack));

export default db;
