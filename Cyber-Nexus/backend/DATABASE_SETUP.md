# Database Setup Guide (MariaDB / MySQL)

This file explains exactly how to prepare SQL database for the backend.

## Prerequisites

- MariaDB or MySQL installed and running
- A DB user with create privileges

## Step 1: Create database

```sql
CREATE DATABASE cyber_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Configure environment

In `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cyber_nexus
```

Update username/password/host/port as needed.

## Step 3: Initialize schema and seed

From `backend/` folder:

```bash
npm run db:init
```

This executes:

- `backend/sql/schema.sql`
- `backend/sql/seed.sql`

## Tables created

- `projects`
- `project_comments`
- `messages`
- `about_content`
- `cv_documents`

## Important constraints

- Comments are linked to specific project via foreign key.
- Messages require at least one contact channel in app-level validation.
- Only one active CV is enforced by application logic (old CVs are set inactive before new upload).

## Optional checks

```sql
SHOW TABLES;
SELECT COUNT(*) FROM projects;
```

## Reset strategy (dev only)

```sql
DROP DATABASE cyber_nexus;
CREATE DATABASE cyber_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run `npm run db:init` again.
