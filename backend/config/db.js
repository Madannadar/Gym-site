import pkg from "pg";
import dotenv from "dotenv";
// import schema from "./schema.js"; // Commented out as per your code

dotenv.config();

const { Client } = pkg;

const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://your-db-user:your-db-password@localhost:5432/your-db-name";

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
console.log("🔍 Database URL:", dbUrl);

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

    // Uncomment if you need to create tables
    // await db.query(schema);
    // console.log("✅ Database tables created successfully!");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.stack);
    process.exit(1);
  }
}

// Connect once at app start
connectAndCreateTables().catch((err) => {
  console.error("❌ Failed to initialize database:", err.stack);
  process.exit(1);
});

// Handle client errors
db.on("error", (err) => {
  console.error("❌ Client error:", err.stack);
  process.exit(1);
});

export default db;
