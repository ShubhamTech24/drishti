import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config(); // Loads .env file

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    // Either clear only NULL rows:
    // await pool.query("DELETE FROM users WHERE username IS NULL;");

    // Or truncate everything:
    await pool.query("TRUNCATE TABLE users;");

    console.log("✅ Cleanup complete!");
  } catch (err) {
    console.error("❌ Error during cleanup:", err);
  } finally {
    await pool.end();
  }
}

main();
