import app from "./app.js";
import db from "./config/db.js";  // this import ensures DB is connected

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Optional: handle graceful shutdown to close DB connection
process.on("SIGINT", async () => {
  console.log("Closing DB connection...");
  await db.end();
  process.exit();
});
