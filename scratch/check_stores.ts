import "dotenv/config";
import { getDb } from "./server/db";
import { stores } from "./server/schema";

async function checkStores() {
  const db = getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  const result = await db.select().from(stores);
  console.log("Stores Table Content:");
  console.log(JSON.stringify(result, null, 2));
}

checkStores().catch(console.error);
