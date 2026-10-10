
# 🎓 RKhub — College Learning Resource Platform

<p align="center">
  <b>One platform for college notes, previous-year questions, syllabi, and AI-assisted exam preparation.</b>
</p>

<p align="center">
  <a href="https://github.com/mdsabit05/RKhub">
    <img src="https://img.shields.io/badge/Project-RKhub-2563EB?style=for-the-badge" alt="RKhub" />
  </a>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178C6?style=for-the-badge" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Hono-E36002?style=for-the-badge" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge" alt="Database" />
</p>

---

## 📖 About

RKhub is a college learning resource platform designed to help students access academic materials in one place.

It organizes study resources by academic year, course, semester, subject, and unit, making it easier for students to find the material they need.

The project also explores AI-assisted academic search and exam preparation using natural-language queries.

## ✨ Features

### 📚 Academic Resources
- Subject-wise and unit-wise study notes
- Previous-year question papers (PYQs)
- College syllabus and reference materials
- Structured navigation across academic years, courses, and semesters

### 🤖 AI Academic Assistant
- Search for learning resources using natural-language queries
- Find relevant notes and previous-year papers
- Explore syllabus information
- Generate exam-question suggestions using available academic resources and configured AI services

### 🛡️ Administration
- Protected administrative interface
- Resource management and PDF uploads
- Configurable storage providers
- Backend endpoints for resource operations

*Features depend on the current deployment configuration and available academic data.*

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Hono, TypeScript, Node.js |
| Database | PostgreSQL |
| Database access | PostgreSQL client / project database utilities |
| AI integration | NVIDIA AI |
| File storage |B2|
| Deployment | Render configuration |

## 🔄 Resource Navigation

The platform uses structured navigation to help students locate materials.

| Resource | Navigation flow |
|---|---|
| Notes | Year → Course → Semester → Subject → Unit → PDF |
| PYQs | Year → Course → Semester → Subject → Unit → PDF |
| Syllabus | Year → Course → Semester → Subject → PDF |
| Reference | Year → Course → Semester → Subject → Unit → Materials |

## 🏗️ Architecture

```text
RKhub
├── frontend/       # React + Vite application
├── backend/        # Hono API and server logic
│   ├── src/
│   └── public/
├── render.yaml     # Deployment configuration
└── README.md
```

The frontend communicates with the backend API, which handles academic resource operations, database access, and configured AI services.

## 🚀 Getting Started

### Prerequisites

- Node.js compatible with the project's dependencies
- npm
- PostgreSQL database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mdsabit05/RKhub.git
cd RKhub
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create your local environment file from the provided example:

```bash
cp .env.example .env
```

Configure the required database connection and other environment variables using the project's actual configuration.

Initialize and seed the database if required by the project:

```bash
npm run db:init
npm run db:seed
```

Start the backend:

```bash
npm run dev
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file if required by the project and configure the backend API URL.

Start the frontend:

```bash
npm run dev
```

Use the local URL printed by Vite in your terminal.

> Verify the script names and environment-file paths against the current repository before running these commands. Do not commit local `.env` files or credentials.

## 🧪 Testing

Run the backend tests from the backend directory:

```bash
npm test
```

The repository documentation describes integration tests for health checks, admin authentication, protected uploads, and AI assistant queries. Test coverage may change as the project evolves.

## 🔐 Security

- Keep database credentials and API keys in environment variables.
- Use strong, unique admin secrets.
- Validate and authorize protected administrative operations on the server.
- Restrict file uploads and validate uploaded content.
- Never commit credentials, private user data, or production secrets.

## 🎯 Project Goals

RKhub aims to make college academic resources easier to discover and help students prepare for exams through structured materials and AI-assisted search.

## 👨‍💻 Developer

**Sabit Raza**

- GitHub: [@mdsabit05](https://github.com/mdsabit05)
- Portfolio: [Visit my portfolio](https://mdsabit05.github.io/My-Profile/)

---

<p align="center">
  Built to make college learning resources easier to access. 🚀
</p>

