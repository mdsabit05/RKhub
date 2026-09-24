# RKhub Frontend

React + Vite frontend connected to the RKhub Hono/PostgreSQL API.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default API:
`http://localhost:8787`

If the backend uses another URL, set:

```env
VITE_API_URL=http://localhost:8787
```

## Connected resource flows

Notes:
`Year → Course → Semester → Subject → Unit → PDF`

PYQs:
`Year → Course → Semester → Subject → Unit → PDF`

Syllabus:
`Year → Course → Semester → Subject → PDF`

Reference:
`Year → Course → Semester → Subject → Unit → materials/links`

The frontend no longer uses hardcoded curriculum data for these pages. It loads years, courses, semesters, subjects, units and resources from the backend API.
