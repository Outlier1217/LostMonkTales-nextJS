# Quiz Admin Panel

Full-stack admin panel for creating and managing quizzes with questions. Built with Next.js 14 + TypeScript + Prisma + PostgreSQL.

## Features
- Create quizzes with difficulty (Easy/Medium/Hard), category, topic, time limit, negative marking, passing %
- Add questions manually one by one with up to 8 options (A-H)
- Import questions in bulk via CSV or Excel (.xlsx/.xls)
- Edit/delete quizzes and questions
- Publish/unpublish quizzes

## Quick Start (GitHub Codespaces)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Setup database
Create a `.env.local` from the example:
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and set your `DATABASE_URL`:

**Option A — Neon (recommended for Codespaces):**
```
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/quiz_db?sslmode=require"
```

**Option B — Your Hostinger VPS Postgres:**
```
DATABASE_URL="postgresql://postgres:yourpassword@88.222.244.226:5432/quiz_db"
```
> Make sure port 5432 is open in UFW on your VPS: `sudo ufw allow 5432`

### 3. Push schema to DB
```bash
pnpm db:generate
pnpm db:push
```

### 4. Start dev server
```bash
pnpm dev
```
Opens on port 3030. In Codespaces, forward port 3030.

---

## CSV Import Format
Download `public/sample-questions.csv` as a template.

Required columns:
| Column | Description |
|--------|-------------|
| questionText | The question |
| option1 | First option (= A) |
| option2 | Second option (= B) |
| option3 | Third option (= C) |
| option4 | Fourth option (= D) |
| correctAnswer | A, B, C, or D |

Optional:
| Column | Description |
|--------|-------------|
| option5–option6 | Up to 6 options |
| explanation | Why this answer is correct |
| marks | Marks for this question (default: 1) |

---

## VPS PostgreSQL Setup (if using your VPS)
```bash
# On your VPS (88.222.244.226):
sudo apt install postgresql -y
sudo -u postgres psql
CREATE USER quizadmin WITH PASSWORD 'yourpassword';
CREATE DATABASE quiz_db OWNER quizadmin;
\q

# Allow remote connections (edit pg_hba.conf):
sudo nano /etc/postgresql/*/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/*/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
sudo ufw allow 5432
```

## PM2 Deploy on VPS
```bash
pnpm build
pm2 start "pnpm start" --name quiz-admin
pm2 save
```
