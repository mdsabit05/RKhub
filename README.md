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
cp .env.example .env
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

Frontend defaults to:
`http://localhost:5173`

Backend defaults to:
`http://localhost:8787`

The resource pages are connected to PostgreSQL through the Hono API.

## Current resource navigation

Notes:
Year → Course → Semester → Subject → Unit → PDF

PYQs:
Year → Course → Semester → Subject → Unit → PDF

Syllabus:
Year → Course → Semester → Subject → PDF

Reference:
Year → Course → Semester → Subject → Unit → available materials/links

The AI assistant is not connected yet. That should be the next backend module after the resource system is verified.
