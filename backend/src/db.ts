import "dotenv/config";
import pg, { type QueryResultRow } from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const isLocalhost =
  !connectionString ||
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

/**
 * Ensures all required tables and Better Auth columns exist in the database.
 * Safe and idempotent — runs on backend startup for seamless deployment on Render.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  try {
    // Core app tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id SERIAL PRIMARY KEY,
        year_no INTEGER UNIQUE NOT NULL CHECK (year_no BETWEEN 1 AND 4),
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS semesters (
        id SERIAL PRIMARY KEY,
        year_no INTEGER NOT NULL REFERENCES academic_years(year_no) ON DELETE CASCADE,
        semester_no INTEGER UNIQUE NOT NULL CHECK (semester_no BETWEEN 1 AND 8),
        name TEXT NOT NULL,
        UNIQUE (year_no, semester_no)
      );

      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        year_no INTEGER NOT NULL REFERENCES academic_years(year_no) ON DELETE CASCADE,
        semester_no INTEGER NOT NULL REFERENCES semesters(semester_no) ON DELETE CASCADE,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        subject_type TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE(course_id, semester_no, code)
      );

      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        unit_no INTEGER NOT NULL CHECK (unit_no BETWEEN 1 AND 10),
        name TEXT NOT NULL,
        UNIQUE(subject_id, unit_no)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        image TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS "image" TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
        END IF;
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "token" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES users("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES users("id") ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMPTZ,
        "refreshTokenExpiresAt" TIMESTAMPTZ,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");
      CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");
      CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"("identifier");
    `);

    // Resources table (depends on users, subjects, units)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        resource_type TEXT NOT NULL CHECK (
          resource_type IN ('notes', 'pyq', 'syllabus', 'reference', 'complete_syllabus')
        ),
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
        year_no INTEGER REFERENCES academic_years(year_no),
        semester_no INTEGER REFERENCES semesters(semester_no),
        title TEXT NOT NULL,
        description TEXT,
        file_url TEXT,
        external_url TEXT,
        uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        file_size BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (file_url IS NOT NULL OR external_url IS NOT NULL)
      );

      CREATE INDEX IF NOT EXISTS idx_subject_lookup ON subjects(year_no, semester_no, course_id);
      CREATE INDEX IF NOT EXISTS idx_units_subject ON units(subject_id);
      CREATE INDEX IF NOT EXISTS idx_resources_lookup ON resources(resource_type, subject_id, unit_id);
      CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
    `);

    // Enable trigram extension for fuzzy subject name search (handles misspellings)
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`).catch(() => {});

    // Relax units.unit_no constraint from 1-4 to 1-10 so admins can add more units
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE units DROP CONSTRAINT IF EXISTS units_unit_no_check;
        ALTER TABLE units ADD CONSTRAINT units_unit_no_check CHECK (unit_no BETWEEN 1 AND 10);
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `);

    // Allow year_no and semester_no to be NULL for complete_syllabus resources
    // and extend the resource_type CHECK to include 'complete_syllabus'
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE resources ALTER COLUMN year_no DROP NOT NULL;
        ALTER TABLE resources ALTER COLUMN semester_no DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `);
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_resource_type_check;
        ALTER TABLE resources ADD CONSTRAINT resources_resource_type_check
          CHECK (resource_type IN ('notes', 'pyq', 'syllabus', 'reference', 'complete_syllabus'));
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `);
    console.log("[Database] Schema check and migrations completed successfully.");
  } catch (err) {
    console.error("[Database] Migration check failed:", err);
  }
}
