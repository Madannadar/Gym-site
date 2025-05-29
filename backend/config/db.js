import pkg from "pg";
import dotenv from "dotenv";
import schema from "./schema.js";

dotenv.config();

const { Client } = pkg;

const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://your-db-user:your-db-password@localhost:5432/your-db-name";

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

const db = new Client({
  connectionString: dbUrl,
  connectionTimeoutMillis: 10000,
  query_timeout: 5000,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function connectAndCreateTables() {
  try {
    console.log("🔌 Connecting to PostgreSQL...");
    await db.connect();
    console.log("✅ Connected to PostgreSQL");

    await db.query(schema);
    console.log("✅ Database tables created successfully!");
    
    // DON'T disconnect here, keep connection alive
  } catch (err) {
    console.error("❌ PostgreSQL connection error", err.stack);
    process.exit(1); // Exit app if DB connection fails
  }
}

// Connect once at app start
await connectAndCreateTables();

export default db;
