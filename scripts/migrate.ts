import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Load .env and .env.local
for (const name of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), name);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const value = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_URL not found. Set it in .env.local or the environment."
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Running schema.sql...\n");

  const client = await pool.connect();
  try {
    // Run the entire file in one shot inside a transaction.
    // This avoids the broken split(';') approach and ensures
    // all tables are created atomically — or none are.
    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query("COMMIT");
    console.log("  ✓ Schema applied successfully");
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(`  ✗ Migration failed: ${err.message}`);
    await pool.end();
    process.exit(1);
  } finally {
    client.release();
  }

  // Optionally verify tables exist after migration
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`\nVerified ${result.rows.length} tables in database:`);
    result.rows.forEach((row) => console.log(`  ✓ ${row.table_name}`));
  } catch (err: any) {
    console.error("Could not verify tables:", err.message);
  }

  console.log("\nDone");
  await pool.end();
  process.exit(0);
}

migrate();
