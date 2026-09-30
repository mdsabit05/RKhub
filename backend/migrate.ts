import { query } from "./src/db.js";

async function migrate() {
  console.log("Running migration...");
  try {
    // 1. Create users table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT,
        name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Users table verified/created.");

    // 2. Add uploaded_by column to resources if not exists
    await query(`
      ALTER TABLE resources
        ADD COLUMN IF NOT EXISTS uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log("resources.uploaded_by column verified/added.");

    // 3. Add file_size column to resources if not exists
    await query(`
      ALTER TABLE resources
        ADD COLUMN IF NOT EXISTS file_size BIGINT;
    `);
    console.log("resources.file_size column verified/added.");

    // 4. Create index on uploaded_by
    await query(`
      CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
    `);
    console.log("Index idx_resources_uploaded_by verified/created.");

    const cols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'resources'
      ORDER BY ordinal_position;
    `);
    console.log("Current resources columns:", cols.map(c => `${c.column_name} (${c.data_type})`));

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
