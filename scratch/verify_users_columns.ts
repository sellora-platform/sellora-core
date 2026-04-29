import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function verifyColumns() {
  console.log("Checking columns in 'users' table...");

  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    console.log("Existing Columns:");
    console.table(result.rows);
  } catch (err) {
    console.error("Failed to fetch columns:", err);
  }
}

verifyColumns().catch(console.error);
