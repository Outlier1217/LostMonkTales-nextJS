# Quiz Admin Panel

A full-stack content management system built with Next.js 14, TypeScript, Prisma, and PostgreSQL (Neon), designed to manage Quizzes, Blogs, Art Store products, and Art & Portrait galleries from a single admin dashboard.

The platform uses a self-hosted VPS file server for image storage and supports deployment via PM2 on a Hostinger VPS.

---

# Modules Overview

The system currently contains four major modules:

## 1. Quiz Management

Create, manage, publish, and organize quizzes with advanced configuration options.

### Features

* Create quizzes
* Difficulty levels (Easy / Medium / Hard)
* Categories and topics
* Time limits
* Negative marking support
* Passing percentage configuration
* Publish / unpublish quizzes
* Manual question creation
* CSV and Excel bulk import
* Question explanations
* Up to 8 answer options (A–H)

### Question Import Support

Supported formats:

* CSV
* XLSX
* XLS

Required columns:

| Column        |
| ------------- |
| questionText  |
| option1       |
| option2       |
| option3       |
| option4       |
| correctAnswer |

Optional:

| Column          |
| --------------- |
| option5-option8 |
| explanation     |
| marks           |

---

## 2. Blog Management

A lightweight blogging system built directly into the admin panel.

### Features

* Create blog posts
* Draft & publish workflow
* Category and topic support
* Markdown/plain text content
* YouTube video embedding
* Edit/Delete blogs

### YouTube Support

Supported formats:

* youtube.com/watch
* youtu.be
* youtube.com/live
* youtube.com/shorts

The system initially loads a thumbnail and only renders the iframe player when clicked.

---

## 3. Art Store

An e-commerce style gallery for selling artwork.

Unlike the Portraits module, Art Store includes:

* Admin-created categories
* Pricing
* Contact information
* Multiple images per artwork

### Features

* Category management
* Multiple image uploads
* Artwork pricing
* Contact-to-buy workflow
* Publish/unpublish
* Public storefront

### Workflow

1. Create category
2. Create artwork
3. Upload images
4. Enter details
5. Publish

Public page:

```
/store
```

### Database Models

```prisma
model ArtCategory {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  description String?
}

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

---

## 4. Art & Portraits Gallery

A simplified gallery module designed specifically for showcasing hand-crafted portraits.

Unlike Art Store:

* No pricing
* No contact details
* No category management
* One image per entry
* Fixed categories

### Categories

```prisma
enum PortraitCategory {
  PENCIL_PORTRAITS
  PAINTING
  OIL_ACRYLIC_PORTRAITS
}
```

### Features

* Single upload
* Bulk upload
* Publish/unpublish
* Category filtering
* Public portrait gallery

### Workflow

#### Single Upload

1. Open

```
/admin/portraits/new
```

2. Enter title
3. Select category
4. Upload image
5. Publish (optional)

#### Bulk Upload

1. Open

```
/admin/portraits/bulk
```

2. Select category
3. Upload multiple images
4. Edit auto-generated titles
5. Save all entries

#### Public Gallery

```
/art-portraits
```

Only published portraits are displayed.

### Portrait Model

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

---

# Technology Stack

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Framework       | Next.js 14 (App Router)     |
| Language        | TypeScript                  |
| Database        | PostgreSQL (Neon)           |
| ORM             | Prisma v5                   |
| Styling         | Tailwind CSS                |
| Icons           | Lucide React                |
| Package Manager | pnpm                        |
| File Storage    | Self-hosted VPS File Server |
| Process Manager | PM2                         |

---

# Project Structure

```text
src/
├── app/
│   ├── admin/
│   │   ├── quizzes/
│   │   ├── blogs/
│   │   ├── art/
│   │   └── portraits/
│   ├── store/
│   ├── art-portraits/
│   └── api/
├── components/
│   ├── blogs/
│   ├── art/
│   ├── portraits/
│   └── ui/
├── lib/
└── prisma/
```

---

# Image Storage Architecture

All image uploads are stored on a dedicated VPS file server.

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
Stored Images
```

### File Server Port

```text
3021
```

### Application Port

```text
3030
```

### Uploaded Files Location

```bash
/var/www/art-uploads/files
```

---

# Environment Variables

```env
DATABASE_URL=postgresql://...
FILE_SERVER_URL=http://localhost:3021
```

---

# Local Development

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

Run development server:

```bash
pnpm dev
```

---

# VPS Deployment

```bash
cd /var/www/lostmonktales/quiz-admin/quiz-admin

git pull

pnpm install

pnpm build

pm2 restart quiz-admin
```

---

# PM2

Start application:

```bash
pm2 start "pnpm start" --name quiz-admin
```

Save configuration:

```bash
pm2 save
```

---

# Production Notes

## Dynamic Rendering

Pages that directly query Prisma must use:

```ts
export const dynamic = 'force-dynamic'
```

Examples:

```ts
/admin/portraits/page.tsx
/art-portraits/page.tsx
/admin/art/page.tsx
```

Without this, Next.js may statically cache pages and new database records will not appear after deployment.

---

# Known Issues & Fixes

## 1. Prisma Export Naming

Correct:

```ts
import { prisma } from '@/lib/db'
```

Incorrect:

```ts
import { db } from '@/lib/db'
```

---

## 2. Empty Component Files

Always verify file contents before committing.

A 0-byte file can compile incorrectly and create confusing production issues.

---

## 3. Static Build Cache

Fixed using:

```ts
export const dynamic = 'force-dynamic'
```

---

## 4. PM2 Port Confusion

If package.json contains:

```json
"start": "next start -p 3030"
```

then:

```bash
PORT=4000 pm2 start "pnpm start"
```

will still run on:

```text
3030
```

because the port is hardcoded.

---

# Architecture Summary

```text
Quiz Admin Panel
│
├── Quiz Management
├── Blog Management
├── Art Store
├── Art & Portraits
│
├── Prisma
├── PostgreSQL (Neon)
├── VPS File Server
├── Next.js 14
└── PM2 Deployment
```

This repository serves as a centralized content and media management platform for educational content, blogging, artwork sales, and portrait gallery publishing.
