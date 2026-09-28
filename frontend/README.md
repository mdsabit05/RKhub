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

If the backend uses another URL:

```env
VITE_API_URL=http://localhost:8787
```

## Resource flows

```
Notes:     Year → Course → Semester → Subject → Unit → PDF
PYQs:      Year → Course → Semester → Subject → Unit → PDF
Syllabus:  Year → Course → Semester → Subject → PDF
Reference: Year → Course → Semester → Subject → Unit → materials/links
```

## AI Assistant

The home page includes a natural language AI composer. Queries are sent to
`POST /api/ai/chat` and return found resources or exam predictions.

## Admin portal

The `/admin` page is protected by a passcode gate. The key is verified against
`POST /api/admin/verify`. The session key is stored in `sessionStorage` for the
browser tab only and cleared on logout or tab close.

## Structure

```
src/
├── App.jsx               # Top-level router
├── main.jsx              # React root
├── api.js                # Typed fetch client
├── components/           # Reusable UI components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── AiComposer.jsx
│   ├── Choice.jsx
│   ├── Document.jsx
│   ├── Materials.jsx
│   ├── Selection.jsx
│   └── SubjectList.jsx
├── pages/                # Full route pages
│   ├── Home.jsx
│   ├── ResourcePage.jsx
│   └── AdminPage.jsx
└── constants/
    └── resources.js      # Resource metadata + tones
```
