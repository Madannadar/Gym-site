// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://your-db-user:your-db-password@localhost:5432/your-db-name";

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
console.log("🔍 Database URL:", dbUrl);

// Create a PostgreSQL connection pool
const db = new Pool({
  connectionString: dbUrl,
  max: 10, // max connections
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 100000, // wait up to 100s for a connection
  query_timeout: 5000,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Optional test on startup
async function testConnection() {
  try {
    console.log("🔌 Connecting to PostgreSQL pool...");
    const client = await db.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✅ PostgreSQL pool is ready");
  } catch (err) {
    console.error("❌ Pool connection error:", err.stack);
    process.exit(1);
  }
}

testConnection();

db.on("error", (err) => {
  console.error("❌ Unexpected error on idle client:", err.stack);
  process.exit(1);
});

export default db;
