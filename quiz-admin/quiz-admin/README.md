# Quiz Admin Panel

A full-stack content management system built with **Next.js 14**, **TypeScript**, **Prisma**, and **PostgreSQL (Neon)** for managing educational content, blogs, artwork, portraits, and architecture projects from a single admin dashboard.

The platform uses a self-hosted VPS file server for media storage and is deployed on a Hostinger VPS using PM2.

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
| Database        | PostgreSQL (Neon)           |
| ORM             | Prisma                      |
| Styling         | Tailwind CSS                |
| Icons           | Lucide React                |
| Package Manager | pnpm                        |
| File Storage    | Self-hosted VPS File Server |
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

### Upload Directory

```bash
/var/www/art-uploads/files
```

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

## Environment Variables

```env
DATABASE_URL=postgresql://...
FILE_SERVER_URL=http://localhost:3021
```

---

## Local Development

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

## VPS Deployment

```bash
cd /var/www/lostmonktales/quiz-admin/quiz-admin

git pull

pnpm db:generate

pnpm build

pm2 restart quiz-admin
```

> Run `pnpm install` only when new dependencies are added.

---

## PM2

Start application:

```bash
pm2 start "pnpm start" --name quiz-admin
```

Save PM2 configuration:

```bash
pm2 save
```

---

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
