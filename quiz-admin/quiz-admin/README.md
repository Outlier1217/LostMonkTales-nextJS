# Quiz Admin Panel

Full-stack admin panel for creating and managing quizzes and blog posts. Built with Next.js 14 + TypeScript + Prisma + PostgreSQL (Neon).

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
  timeLimit       Int
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
  content     String        // plain text or markdown
  youtubeUrl  String?       // optional YouTube link
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                  # Dashboard (stats + recent quizzes)
│   │   ├── layout.tsx                # Sidebar navigation
│   │   ├── quizzes/
│   │   │   ├── page.tsx              # All quizzes list
│   │   │   ├── new/page.tsx          # Create quiz
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Edit quiz
│   │   │       └── questions/        # Manage questions
│   │   └── blogs/
│   │       ├── page.tsx              # Blog list
│   │       ├── new/page.tsx          # Create blog
│   │       └── [id]/edit/page.tsx    # Edit blog
│   └── api/
│       ├── quizzes/                  # Quiz CRUD endpoints
│       └── blogs/                    # Blog CRUD endpoints
└── components/
    ├── ui/                           # Button, Input, Select, Textarea, Badge
    └── blogs/
        ├── BlogForm.tsx              # Shared create/edit form
        ├── YoutubeEmbed.tsx          # Thumbnail → iframe player
        └── DeleteBlogButton.tsx      # Delete with confirmation
```

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
# On your VPS:
sudo apt install postgresql -y
sudo -u postgres psql
CREATE USER quizadmin WITH PASSWORD 'yourpassword';
CREATE DATABASE quiz_db OWNER quizadmin;
\q

# Allow remote connections
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