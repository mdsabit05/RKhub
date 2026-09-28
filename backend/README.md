# RKhub Backend

TypeScript + Hono + PostgreSQL backend for the RKhub College Academic Portal.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=8787
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rkhub
CORS_ORIGIN=http://localhost:5173
ADMIN_SECRET_KEY=rkhub-admin-2026
# GEMINI_API_KEY=your_gemini_key   (optional)
STORAGE_PROVIDER=local
```

## Initialize and seed database

```bash
npm run db:init
npm run db:seed
npm run dev
```

## API endpoints

```
GET  /health
GET  /api/resources/years
GET  /api/resources/courses?year=1
GET  /api/resources/semesters?year=1
GET  /api/resources/subjects?year=1&course=BCA&semester=1
GET  /api/resources/units?subjectId=1
GET  /api/resources/:id
GET  /api/resources/resolve?type=notes&year=2&course=BCA&semester=3&subjectCode=CC-202&unitNo=1
GET  /api/resources/list?type=reference&subjectId=1&unitId=1
POST /api/resources/upload         (requires x-admin-key header)
POST /api/admin/verify             (JSON { key })
POST /api/ai/chat                  (JSON { message, context })
```

## Admin key

The upload endpoint is protected. Include `x-admin-key: <your-key>` in the request header.  
Verify a key via `POST /api/admin/verify` → `{ ok: true }`.

## Gemini AI

If `GEMINI_API_KEY` is set, the AI assistant uses Gemini 2.5 Flash for:
- General academic Q&A
- Smart exam question paper prediction with structured output

Without the key the service falls back to PostgreSQL keyword matching (still fully functional).

## Cloud storage

Set `STORAGE_PROVIDER=s3` (or `r2` / `supabase`) and provide:

```env
S3_ENDPOINT=https://...
S3_BUCKET=rkhub-pdfs
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_DOMAIN=https://cdn.example.com
```

Defaults to `local` (disk storage at `public/pdfs/`).

## Data model

```
academic_years → semesters → courses → subjects → units → resources
```

## Run tests

```bash
npm test
```

8 integration tests covering health, auth, upload, and AI chat.
