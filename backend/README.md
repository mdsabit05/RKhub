# RKhub Backend

TypeScript + Hono + PostgreSQL backend for the RKhub College Academic Portal.

## 1. Create PostgreSQL database

```bash
createdb rkhub
```

Or create a database named `rkhub` using pgAdmin.

## 2. Configure environment

```bash
cp .env.example .env
```

Example:

```env
PORT=8787
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rkhub
CORS_ORIGIN=http://localhost:5173
```

## 3. Install and initialize

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

API:
`http://localhost:8787`

Health:
`http://localhost:8787/health`

## API

```text
GET /api/resources/years
GET /api/resources/courses?year=1
GET /api/resources/semesters?year=1
GET /api/resources/subjects?year=1&course=BCA&semester=1
GET /api/resources/units?subjectId=1
GET /api/resources/:id

GET /api/resources/resolve?type=notes&year=2&course=BCA&semester=3&subjectCode=CC-202&unitNo=1

GET /api/resources/list?type=reference&subjectId=1&unitId=1
```

Supported resource types:

- notes
- pyq
- syllabus
- reference

## Data model

```text
academic_years
  ↓
semesters
  ↓
courses
  ↓
subjects
  ↓
units
  ↓
resources
```

PostgreSQL stores metadata and resource URLs. Actual PDFs can later be stored in object storage (for example S3/R2/Supabase Storage) and their URLs saved in `resources.file_url`.

The BCA curriculum supplied in the project and the BBA subjects transcribed from the supplied screenshots are seeded into PostgreSQL.
