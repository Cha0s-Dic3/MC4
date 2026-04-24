# Cyber Nexus Backend

Node.js + Express + MariaDB/MySQL backend for projects, comments, messages, about section, CV management, and admin operations.

## Features

- Public APIs for frontend:
  - project list/detail
  - comments by project
  - submit contact messages
  - read about content
  - download active CV (PDF)
- Admin APIs under `/api/admin-panel`:
  - full project CRUD with image upload
  - view/delete messages and mark read/unread
  - grouped comments by project with count
  - edit about content
  - upload/update active CV
- Admin panel UI at `/admin-panel`
- Rate limiting, helmet, compression, DB pooling, and upload limits

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure Environment

Copy env template and edit values:

```bash
cp .env.example .env
```

Required values:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `PORT`
- `CORS_ORIGIN`

## 3. Create Database

Use MariaDB/MySQL and create database, for example:

```sql
CREATE DATABASE cyber_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then initialize schema and seed data:

```bash
npm run db:init
```

## 4. Run Backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Backend default URL: `http://localhost:4000`

## 5. Admin Panel

Open:

- `http://localhost:4000/admin-panel`

Login with admin username/password to receive JWT access, then manage projects/about/messages/comments/CV.

## API Routes

Public routes:

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:projectId`
- `GET /api/projects/:projectId/comments`
- `POST /api/projects/:projectId/comments`
- `POST /api/messages`
- `GET /api/about`
- `GET /api/cv/download`

Auth routes:

- `POST /api/auth/login`
- `GET /api/auth/me`

Admin routes (`Authorization: Bearer <jwt>` required):

- `GET /api/admin-panel/overview`
- `GET /api/admin-panel/projects`
- `POST /api/admin-panel/projects` (`multipart/form-data`, field: `image`)
- `PUT /api/admin-panel/projects/:projectId`
- `DELETE /api/admin-panel/projects/:projectId`
- `GET /api/admin-panel/messages`
- `GET /api/admin-panel/messages/:messageId`
- `PATCH /api/admin-panel/messages/:messageId/read`
- `DELETE /api/admin-panel/messages/:messageId`
- `GET /api/admin-panel/comments/grouped`
- `GET /api/admin-panel/comments/project/:projectId`
- `PATCH /api/admin-panel/comments/:commentId`
- `DELETE /api/admin-panel/comments/:commentId`
- `GET /api/admin-panel/about`
- `PUT /api/admin-panel/about`
- `DELETE /api/admin-panel/about`
- `GET /api/admin-panel/cv`
- `POST /api/admin-panel/cv` (`multipart/form-data`, field: `cv`)

## 6. File Upload Paths

- Project images: `backend/uploads/project-images`
- CV files: `backend/uploads/cv`

Files are served from:

- `/uploads/...`

## 7. Security Notes

- Keep `ADMIN_PASSWORD` and `AUTH_SECRET` strong and private.
- In production, place backend behind HTTPS reverse proxy.
- Restrict `CORS_ORIGIN` to your frontend domain.
