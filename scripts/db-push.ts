import { initializeDatabase } from "../src/db/index";

async function main() {
  console.log("[DB Push] Starting database initialization...");
  await initializeDatabase();
  console.log("[DB Push] Database push completed successfully");
  process.exit(0);
}

main().catch((err) => {
  console.error("[DB Push] Failed:", err);
  process.exit(1);
});