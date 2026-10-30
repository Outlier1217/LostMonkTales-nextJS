# Quiz Admin Panel

A full-stack content management system built with **Next.js 14**, **TypeScript**, **Prisma**, and **PostgreSQL (Neon)** for managing educational content, blogs, artwork, portraits, and architecture projects from a single admin dashboard.

The platform uses PostgreSQL 18 and persistent local disk storage on a Hostinger VPS. Course files never use external object storage.

---

## Features

### Quiz Management

* Create and manage quizzes
* Easy / Medium / Hard difficulty levels
* Categories and topics
* Time limits
* Negative marking support
* Passing percentage configuration
* Publish / unpublish quizzes
* Manual question creation
* CSV / XLS / XLSX bulk import
* Question explanations
* Up to 8 answer options (A–H)

### Blog Management

* Create and edit blog posts
* Draft & publish workflow
* Categories and topics
* Markdown/plain text content
* YouTube video embedding
* Edit/Delete blogs

### Art Store

* Category management
* Multiple image uploads
* Pricing and contact information
* Publish/unpublish workflow
* Public storefront

### Art & Portraits Gallery

* Single or bulk uploads
* Fixed portrait categories
* Publish/unpublish support
* Public gallery with category filtering

Categories:

```prisma
enum PortraitCategory {
  PENCIL_PORTRAITS
  PAINTING
  OIL_ACRYLIC_PORTRAITS
}
```

### Architecture Projects

Portfolio showcase module for:

* Interior Projects
* Commercial Projects
* Residential Projects

Features:

* Multiple image uploads
* Project pricing
* Location and size metadata
* Publish/unpublish workflow
* Admin management interface

Categories:

```prisma
enum ArchitectureCategory {
  INTERIOR
  COMMERCIAL
  RESIDENTIAL
}
```

---

## Technology Stack

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Framework       | Next.js 14 (App Router)     |
| Language        | TypeScript                  |
| Database    | PostgreSQL 18 (Hostinger VPS, port 5433) |
| ORM             | Prisma                      |
| Styling         | Tailwind CSS                |
| Icons           | Lucide React                |
| Package Manager | pnpm                        |
| File Storage    | Private local VPS filesystem for course resources; existing file server for public media |
| Process Manager | PM2                         |

---

## Project Structure

```text
src/
├── app/
│   ├── admin/
│   │   ├── quizzes/
│   │   ├── blogs/
│   │   ├── art/
│   │   ├── portraits/
│   │   └── architecture/
│   ├── store/
│   ├── art-portraits/
│   ├── architecture/
│   └── api/
├── components/
│   ├── art/
│   ├── portraits/
│   ├── architecture/
│   ├── blogs/
│   └── ui/
├── prisma/
└── lib/
```

---

## Image Storage Architecture

All media uploads are stored on a dedicated VPS file server.

```text
Next.js App
      |
      v
/api/upload
      |
      v
VPS File Server (3021)
      |
      v
Stored Files
```

### Ports

```text
Application: 3030
File Server: 3021
```

### Existing public-media upload directory

```bash
/var/www/art-uploads/files
```

### Private course-resource storage

Course documents are written by the Next.js process directly to `COURSE_FILE_STORAGE_DIR`.
The resource route checks the published course and the requesting user's entitlement before
reading a file. The storage key is a random UUID with an allowlisted extension, so private
files must not be placed in the public media directory.

The default upload limit is 100 MiB and can be changed with
`COURSE_MAX_FILE_SIZE_BYTES`. `COURSE_STORAGE_QUOTA_BYTES` optionally caps aggregate course
storage; `0` leaves the filesystem as the practical limit. VPS disk capacity is the ultimate
maximum content capacity.

## Safe VPS deployment

Run these commands on the Hostinger VPS as an administrator, adjusting the service account to
the actual PM2 application owner:

```bash
sudo install -d -o <app-user> -g <app-group> -m 0750 /var/lib/lost-monk-tales/course-resources
sudo -u <app-user> test -w /var/lib/lost-monk-tales/course-resources
```

Set the following in the VPS application's environment (never commit these values):

```env
DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5433/lost_monk_tales
COURSE_FILE_STORAGE_DIR=/var/lib/lost-monk-tales/course-resources
COURSE_MAX_FILE_SIZE_BYTES=104857600
COURSE_STORAGE_QUOTA_BYTES=0
```

After backing up the production database, deploy the reviewed migration from the application
directory. Do not run this against production from Codespaces:

```bash
pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pnpm build
pm2 restart <pm2-app-name> --update-env
curl -fsS http://127.0.0.1:3030/courses >/dev/null
sudo -u <app-user> sh -c 'printf persistent-check > /var/lib/lost-monk-tales/course-resources/.deployment-check && test -s /var/lib/lost-monk-tales/course-resources/.deployment-check'
pm2 restart <pm2-app-name> --update-env
sudo -u <app-user> test -s /var/lib/lost-monk-tales/course-resources/.deployment-check
sudo rm /var/lib/lost-monk-tales/course-resources/.deployment-check
```

The development error `public.courses does not exist` means the course migration has not been
applied to that development database. Apply it only to a safe development database with
`pnpm exec prisma migrate deploy`; apply it to the VPS database only during the controlled
deployment above.

---

## Database Models

### Artwork

```prisma
model Artwork {
  id          String @id @default(cuid())
  title       String
  description String?
  price       Float
  contact     String
  images      Json
  categoryId  String
  isPublished Boolean @default(false)
}
```

### Portrait

```prisma
model Portrait {
  id          String @id @default(cuid())
  title       String
  image       String
  category    PortraitCategory
  isPublished Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Architecture Project

```prisma
model ArchitectureProject {
  id          String               @id @default(cuid())
  title       String
  description String?
  location    String?
  size        String?
  price       String?
  category    ArchitectureCategory
  images      Json
  isPublished Boolean              @default(false)
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  @@index([category])
  @@map("architecture_projects")
}
```

---

## Environment configuration

```env
DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5433/lost_monk_tales
AUTH_SECRET=<long-random-secret>
ADMIN_USERNAME=<admin-username>
ADMIN_PASSWORD=<admin-password>
FILE_SERVER_INTERNAL_URL=http://127.0.0.1:3021
FILE_SERVER_PUBLIC_URL=http://88.222.244.226:3021
COURSE_FILE_STORAGE_DIR=/var/lib/lost-monk-tales/course-resources
COURSE_MAX_FILE_SIZE_BYTES=104857600
COURSE_STORAGE_QUOTA_BYTES=0
```

---

## Local development

Install dependencies:

```bash
pnpm install
```

Generate Prisma Client:

```bash
pnpm db:generate
```

Push schema:

```bash
pnpm db:push
```

Start development server:

```bash
pnpm dev
```

---

## One-time VPS setup

Install Node.js 20.20.2, pnpm 10.34.3, PostgreSQL 18 client tools, Git, curl, and PM2 for the
same user that owns the existing `quiz-admin` PM2 process. Keep production `.env` only at
`/var/www/lostmonktales/quiz-admin/quiz-admin/.env`; `pnpm deploy` never creates or overwrites it.

Create persistent course storage without touching existing media:

```bash
sudo install -d -o <app-user> -g <app-group> -m 0750 /var/lib/lost-monk-tales/course-resources
sudo -u <app-user> test -w /var/lib/lost-monk-tales/course-resources
```

Keep the existing `art-files` PM2 process on port 3021. If `quiz-admin` needs initial registration,
use `ecosystem.config.cjs` and run `pm2 save`; do not start a second process.

## Regular deployment

```bash
cd /var/www/lostmonktales/quiz-admin/quiz-admin
pnpm deploy
```

The script validates the directory, required `.env` values, `main` branch, and PostgreSQL 18
tools; pulls with `git pull --ff-only`; installs the frozen lockfile; creates and verifies a
timestamped custom-format backup under `/root/db-backups` with mode 0700; applies migrations;
generates Prisma Client; builds; restarts only the existing `quiz-admin` process with
`--update-env`; saves PM2; and checks `http://127.0.0.1:3030/api/health`. It stops before
migrations or restart if prerequisites, backup, or verification fail.

## Backup recovery and rollback

Backups are retained under `/root/db-backups` and can be inspected with:

```bash
pg_restore --list /root/db-backups/<timestamped-backup>.dump
```

For a failed build, PM2 is not restarted. For an application rollback, check out a previously
reviewed commit on `main` and run `pnpm deploy`. Database migrations are forward-only; restore
a backup only under a separate, reviewed recovery plan. Never delete the database, course
resources, or `/var/www/art-uploads/files`.

## Production Notes

### Dynamic Rendering

Pages that directly query Prisma should use:

```ts
export const dynamic = "force-dynamic"
```

Example:

```ts
/admin/art/page.tsx
/admin/portraits/page.tsx
/admin/architecture/page.tsx
/art-portraits/page.tsx
```

This prevents stale cached data after deployment.

---

## Common Issues

### Prisma Import

Correct:

```ts
import { prisma } from "@/lib/db"
```

Incorrect:

```ts
import { db } from "@/lib/db"
```

### Empty Files

Always verify files before committing to avoid accidental 0-byte files.

### PM2 Port Conflicts

If `package.json` contains:

```json
"start": "next start -p 3030"
```

the application will always run on port `3030`, regardless of the `PORT` environment variable.

---

## Architecture Overview

```text
Quiz Admin Panel
│
├── Quiz Management
├── Blog Management
├── Art Store
├── Art & Portraits
├── Architecture Projects
│
├── Prisma
├── PostgreSQL (Neon)
├── VPS File Server
├── Next.js 14
└── PM2 Deployment
```
