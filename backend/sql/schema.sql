CREATE TABLE IF NOT EXISTS academic_years (
  id SERIAL PRIMARY KEY,
  year_no INTEGER UNIQUE NOT NULL CHECK (year_no BETWEEN 1 AND 3),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS semesters (
  id SERIAL PRIMARY KEY,
  year_no INTEGER NOT NULL REFERENCES academic_years(year_no) ON DELETE CASCADE,
  semester_no INTEGER UNIQUE NOT NULL CHECK (semester_no BETWEEN 1 AND 6),
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
  unit_no INTEGER NOT NULL CHECK (unit_no BETWEEN 1 AND 4),
  name TEXT NOT NULL,
  UNIQUE(subject_id, unit_no)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  token TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  resource_type TEXT NOT NULL CHECK (
    resource_type IN ('notes', 'pyq', 'syllabus', 'reference')
  ),
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  year_no INTEGER NOT NULL REFERENCES academic_years(year_no),
  semester_no INTEGER NOT NULL REFERENCES semesters(semester_no),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (file_url IS NOT NULL OR external_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_subject_lookup
  ON subjects(year_no, semester_no, course_id);

CREATE INDEX IF NOT EXISTS idx_units_subject
  ON units(subject_id);

CREATE INDEX IF NOT EXISTS idx_resources_lookup
  ON resources(resource_type, subject_id, unit_id);

CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by
  ON resources(uploaded_by);
