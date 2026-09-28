# RKhub Full Stack

```text
React + Vite
      ↓
Hono + TypeScript API
      ↓
PostgreSQL
```

## Start backend

```bash
cd backend
npm install
cp .env.example .env     # edit DATABASE_URL + ADMIN_SECRET_KEY
npm run db:init
npm run db:seed
npm run dev
```

## Start frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8787` |
| Health check | `http://localhost:8787/health` |

---

## Resource navigation flows

```
Notes:     Year → Course → Semester → Subject → Unit → PDF
PYQs:      Year → Course → Semester → Subject → Unit → PDF
Syllabus:  Year → Course → Semester → Subject → PDF
Reference: Year → Course → Semester → Subject → Unit → materials/links
```

---

## Admin portal

The `/admin` page in the frontend is **protected by a passcode gate**.

Default key (set in `backend/.env`):
```
ADMIN_SECRET_KEY=rkhub-admin-2026
```

Change this before deploying. The key is verified via `POST /api/admin/verify`.
Uploads require the key in the `x-admin-key` request header.

---

## AI Academic Assistant

The home page AI composer supports natural language queries:

- `Give me BCA 2nd year DBMS Unit 1 notes`
- `Find the 2025 DBMS PYQ`
- `Show me BCA syllabus`
- `Predict DBMS exam questions`

### Gemini integration (optional)

To enable real Gemini-powered conversational answers and exam prediction:

```env
GEMINI_API_KEY=your_api_key_here
```

Without the key the assistant still searches PostgreSQL with the keyword matching engine.

---

## Storage

PDF uploads default to local disk (`backend/public/pdfs/...`).
To use cloud storage set in `backend/.env`:

```env
STORAGE_PROVIDER=s3   # or r2 / supabase
S3_ENDPOINT=https://...
S3_BUCKET=rkhub-pdfs
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_DOMAIN=https://cdn.example.com
```

---

## Run tests

```bash
cd backend
npm test
```

Runs 8 integration tests covering health, admin auth, protected upload, and AI assistant queries.

---

## Project structure

```
rkhub-fullstack/
├── backend/
│   ├── src/
│   │   ├── app.ts                   # Hono app + CORS + routes
│   │   ├── db.ts                    # PostgreSQL pool
│   │   ├── index.ts                 # HTTP server entry
│   │   ├── routes/
│   │   │   ├── resources.ts         # Resource CRUD + upload
│   │   │   ├── ai.ts                # AI chat endpoint
│   │   │   └── admin.ts             # Admin key verification
│   │   └── services/
│   │       ├── ai.service.ts        # Intent detection + Gemini
│   │       └── storage.service.ts   # Local / S3 / R2 / Supabase
│   └── sql/
│       ├── schema.sql
│       └── seed.sql                 # BCA + BBA full curriculum
│
└── frontend/
    └── src/
        ├── App.jsx                  # Top-level router
        ├── main.jsx                 # React root mount
        ├── api.js                   # Fetch client
        ├── components/              # Shared UI components
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── AiComposer.jsx
        │   ├── Choice.jsx
        │   ├── Document.jsx
        │   ├── Materials.jsx
        │   ├── Selection.jsx
        │   └── SubjectList.jsx
        ├── pages/                   # Route-level page components
        │   ├── Home.jsx
        │   ├── ResourcePage.jsx
        │   └── AdminPage.jsx
        └── constants/
            └── resources.js         # Resource metadata
```
