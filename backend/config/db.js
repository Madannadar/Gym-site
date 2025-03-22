import pkg from "pg";
import fs from "fs";
import dotenv from "dotenv";
import schema from "./schema.js";
dotenv.config();
const { Client } = pkg;
const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://your-db-user:your-db-password@localhost:5432/your-db-name";

const db = new Client({
  connectionString: dbUrl, // Pass the URL here
  connectionTimeoutMillis: 10000, // Set connection timeout to 10 seconds
  query_timeout: 5000, // Set query timeout to 5 seconds
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
});

async function createTables() {
  try {
    await db.query(schema);
    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

async function connectAndCreateTables() {
  try {
    await db.connect();
    console.log("Connected to PostgreSQL");
    await createTables();
  } catch (err) {
    console.error("PostgreSQL connection error", err.stack);
  }
}

connectAndCreateTables();

export default db;
