# Quiz Admin Panel

Full-stack admin panel for creating and managing quizzes, blog posts, and an art store. Built with Next.js 14 + TypeScript + Prisma + PostgreSQL (Neon).

---

## Features

### Quizzes
- Create quizzes with difficulty (Easy / Medium / Hard), category, topic, time limit, negative marking, passing %
- Add questions manually one by one with up to 8 options (A–H)
- Import questions in bulk via CSV or Excel (.xlsx / .xls)
- Edit / delete quizzes and questions
- Publish / unpublish quizzes

### Blogs
- Create blog posts with category, topic, title, and content (plain text or markdown)
- Attach an optional YouTube video — shows thumbnail with play button, loads player on click
- Save as Draft or Publish directly
- Edit and delete posts with inline confirmation

### Art Store
- Admin creates categories first (e.g. Watercolor, Acrylic, Digital Art)
- Add artworks with multiple images, title, description, price, and contact info
- Images are uploaded directly to a self-hosted VPS file server (port 3021) and served via HTTP
- Publish / unpublish individual artworks
- Public store page at `/store` with category filter, image carousel, and "Contact to Buy" reveal button
- Image proxy route (`/api/img`) for Codespace development — not needed in production

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma v5 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Package Manager | pnpm |
| File Storage | Self-hosted VPS (Express static server) |

---

## Quick Start (GitHub Codespaces)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Setup environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your `DATABASE_URL`:

**Option A — Neon (recommended for Codespaces):**
```
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

**Option B — Hostinger VPS Postgres:**
```
DATABASE_URL="postgresql://postgres:yourpassword@YOUR_VPS_IP:5432/quiz_db"
```
> Make sure port 5432 is open on your VPS: `sudo ufw allow 5432`

### 3. Push schema to DB
```bash
pnpm db:generate
pnpm db:push
```

Or if using migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start dev server
```bash
pnpm dev
```
Opens on port 3030. In Codespaces, forward port 3030.

---

## Database Schema

### Quiz
```prisma
model Quiz {
  id              String     @id @default(cuid())
  title           String
  description     String?
  difficulty      Difficulty @default(MEDIUM)
  category        String
  topic           String
  timeLimit       Int        // in minutes, 0 = no limit
  negativeMarking Boolean    @default(false)
  negativePenalty Float      @default(0.25)
  passingPercent  Float      @default(60.0)
  isPublished     Boolean    @default(false)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  questions       Question[]
}
```

### Question
```prisma
model Question {
  id            String   @id @default(cuid())
  quizId        String
  questionText  String
  options       Json     // Array of { id: string, text: string }
  correctAnswer String
  explanation   String?
  marks         Float    @default(1.0)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Blog
```prisma
model Blog {
  id          String   @id @default(cuid())
  title       String
  category    String
  topic       String
  content     String   // markdown/rich text
  youtubeUrl  String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ArtCategory
```prisma
model ArtCategory {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  artworks    Artwork[]
}
```

### Artwork
```prisma
model Artwork {
  id          String      @id @default(cuid())
  title       String
  description String?
  price       Float
  contact     String      // WhatsApp number or email
  images      Json        // String[] — array of VPS image URLs
  categoryId  String
  category    ArtCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  isPublished Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                      # Dashboard (stats + recent quizzes)
│   │   ├── layout.tsx                    # Sidebar navigation
│   │   ├── quizzes/
│   │   │   ├── page.tsx                  # All quizzes list
│   │   │   ├── new/page.tsx              # Create quiz
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Edit quiz
│   │   │       └── questions/            # Manage questions
│   │   ├── blogs/
│   │   │   ├── page.tsx                  # Blog list
│   │   │   ├── new/page.tsx              # Create blog
│   │   │   └── [id]/edit/page.tsx        # Edit blog
│   │   └── art/
│   │       ├── page.tsx                  # Artworks list (admin)
│   │       ├── new/page.tsx              # Add artwork
│   │       ├── [id]/edit/page.tsx        # Edit artwork
│   │       └── categories/
│   │           ├── page.tsx              # Categories list
│   │           └── new/page.tsx          # Add category
│   ├── store/
│   │   ├── page.tsx                      # Public art store (SSR)
│   │   ├── StoreClient.tsx               # Client: filter + grid
│   │   └── ArtCard.tsx                   # Image carousel + contact reveal
│   └── api/
│       ├── quizzes/                      # Quiz CRUD endpoints
│       ├── blogs/                        # Blog CRUD endpoints
│       ├── art/                          # Artwork CRUD endpoints
│       │   └── [id]/route.ts
│       ├── art-categories/               # Category CRUD endpoints
│       │   └── [id]/route.ts
│       ├── upload/route.ts               # Proxies file uploads to VPS
│       └── img/route.ts                  # Image proxy (Codespace dev only)
└── components/
    ├── ui/                               # Button, Input, Select, Textarea, Badge
    ├── blogs/
    │   ├── BlogForm.tsx
    │   ├── YoutubeEmbed.tsx
    │   └── DeleteBlogButton.tsx
    └── art/
        ├── ArtworkForm.tsx               # Shared create/edit form
        ├── ImageUploader.tsx             # Drag-drop multi-image upload to VPS
        ├── PublishToggle.tsx             # Inline publish/unpublish button
        ├── DeleteArtworkButton.tsx       # Delete with confirmation
        └── DeleteCategoryButton.tsx      # Delete with artwork count guard
```

---

## Art Store API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/art` | Fetch all artworks |
| `POST` | `/api/art` | Create a new artwork |
| `GET` | `/api/art/:id` | Fetch single artwork |
| `PATCH` | `/api/art/:id` | Update an artwork |
| `DELETE` | `/api/art/:id` | Delete an artwork |
| `GET` | `/api/art-categories` | Fetch all categories |
| `POST` | `/api/art-categories` | Create a category |
| `PATCH` | `/api/art-categories/:id` | Update a category |
| `DELETE` | `/api/art-categories/:id` | Delete a category |
| `POST` | `/api/upload` | Upload images to VPS file server |
| `GET` | `/api/img?url=...` | Image proxy for Codespace dev |

---

## Blog API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/blogs` | Fetch all blogs |
| `POST` | `/api/blogs` | Create a new blog |
| `GET` | `/api/blogs/:id` | Fetch single blog |
| `PATCH` | `/api/blogs/:id` | Update a blog |
| `DELETE` | `/api/blogs/:id` | Delete a blog |

---

## VPS File Server Setup (Art Store Images)

Images are stored on a self-hosted Express server on your Hostinger VPS.

### First-time setup on VPS

```bash
mkdir -p /var/www/art-uploads/files
cd /var/www/art-uploads
npm init -y
npm install express cors
```

Create `server.js`:

```javascript
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(cors())
app.use('/uploads', express.static('/var/www/art-uploads/files'))

app.post('/upload', express.raw({ type: '*/*', limit: '20mb' }), (req, res) => {
  const original = req.headers['x-filename'] || `file-${Date.now()}`
  const ext = path.extname(original)
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const dir = '/var/www/art-uploads/files'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), req.body)
  res.json({ url: `http://YOUR_VPS_IP:3021/uploads/${filename}` })
})

app.delete('/uploads/:filename', (req, res) => {
  const filepath = path.join('/var/www/art-uploads/files', req.params.filename)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  res.json({ success: true })
})

app.listen(3021, () => console.log('Art file server running on port 3021'))
```

Start with PM2:

```bash
npm install -g pm2
pm2 start server.js --name art-files
pm2 save
sudo ufw allow 3021
```

### Uploaded files location
```
/var/www/art-uploads/files/
```

### Image URLs stored in DB
```
http://YOUR_VPS_IP:3021/uploads/1234567890-abc123.jpg
```

---

## Art Store — Admin Workflow

1. Go to `/admin/art/categories/new` — create at least one category
2. Go to `/admin/art/new` — add an artwork
3. Upload one or more images (drag & drop or click)
4. Fill in title, category, description, price, contact
5. Check "Publish immediately" or leave as draft
6. Public store is live at `/store`

> **Note on images in Codespace:** Images appear blank in Codespace preview due to cross-origin restrictions. The `/api/img` proxy fixes this for development. In production, images load directly from the VPS URL with no proxy needed.

---

## CSV Import Format for Questions

Download `public/sample-questions.csv` as a template.

Required columns:

| Column | Description |
|---|---|
| questionText | The question |
| option1 | First option (= A) |
| option2 | Second option (= B) |
| option3 | Third option (= C) |
| option4 | Fourth option (= D) |
| correctAnswer | A, B, C, or D |

Optional columns:

| Column | Description |
|---|---|
| option5 – option8 | Up to 8 options total |
| explanation | Why this answer is correct |
| marks | Points for this question (default: 1) |

---

## YouTube Embed Notes

Supports all YouTube URL formats:
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/live/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

Shows a clickable thumbnail first (works everywhere including Codespaces). On click, loads the iframe player with autoplay. YouTube Error 153 in Codespaces is a domain restriction by YouTube — it does not affect production deployments.

---

## VPS PostgreSQL Setup (if not using Neon)

```bash
sudo apt install postgresql -y
sudo -u postgres psql
CREATE USER quizadmin WITH PASSWORD 'yourpassword';
CREATE DATABASE quiz_db OWNER quizadmin;
\q

sudo nano /etc/postgresql/*/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/*/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
sudo ufw allow 5432
```

---

## PM2 Deploy on VPS

```bash
pnpm build
pm2 start "pnpm start" --name quiz-admin
pm2 save
```