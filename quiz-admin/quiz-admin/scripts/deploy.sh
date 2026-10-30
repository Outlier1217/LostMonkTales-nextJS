#!/usr/bin/env bash
set -Eeuo pipefail

readonly expected_dir="/var/www/lostmonktales/quiz-admin/quiz-admin"
readonly backup_dir="/root/db-backups"
readonly health_url="http://127.0.0.1:3030/api/health"

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

trap 'printf "\nERROR: deployment failed on line %s\n" "$LINENO" >&2' ERR

[[ "$PWD" == "$expected_dir" ]] || fail "Run pnpm deploy from $expected_dir (current directory: $PWD)."
[[ -f .env ]] || fail "Production .env is missing. Create it on the VPS; deploy never creates or overwrites it."
[[ "$(git branch --show-current)" == "main" ]] || fail "The deployment branch must be main."
command -v git >/dev/null || fail "git is required."
command -v pnpm >/dev/null || fail "pnpm is required."
command -v pm2 >/dev/null || fail "pm2 is required."
command -v curl >/dev/null || fail "curl is required."
command -v pg_dump >/dev/null || fail "PostgreSQL 18 pg_dump is required."
command -v pg_restore >/dev/null || fail "PostgreSQL 18 pg_restore is required."

for variable in DATABASE_URL AUTH_SECRET ADMIN_USERNAME ADMIN_PASSWORD FILE_SERVER_INTERNAL_URL FILE_SERVER_PUBLIC_URL COURSE_FILE_STORAGE_DIR COURSE_MAX_FILE_SIZE_BYTES COURSE_STORAGE_QUOTA_BYTES; do
  grep -Eq "^${variable}=[^[:space:]]" .env || fail "Required .env variable is missing or empty: ${variable}"
done

database_url="$(awk -F= '$1 == "DATABASE_URL" { sub(/^[^=]*=/, ""); print; exit }' .env)"
database_url="${database_url#\"}"
database_url="${database_url%\"}"
database_url="${database_url#\'}"
database_url="${database_url%\'}"
[[ -n "$database_url" ]] || fail "DATABASE_URL could not be read from .env."

pg_dump_version="$(pg_dump --version)"
pg_restore_version="$(pg_restore --version)"
[[ "$pg_dump_version" =~ PostgreSQL[[:space:]]18([.]|$) ]] || fail "pg_dump must be PostgreSQL 18 (found: $pg_dump_version)."
[[ "$pg_restore_version" =~ PostgreSQL[[:space:]]18([.]|$) ]] || fail "pg_restore must be PostgreSQL 18 (found: $pg_restore_version)."

printf 'Pulling latest main...\n'
git pull --ff-only origin main

printf 'Installing locked dependencies...\n'
pnpm install --frozen-lockfile

umask 077
install -d -m 0700 "$backup_dir"
backup_file="$backup_dir/lost_monk_tales_$(date -u +%Y%m%dT%H%M%SZ).dump"
printf 'Creating PostgreSQL backup: %s\n' "$backup_file"
pg_dump --format=custom --no-owner --file="$backup_file" "$database_url"
[[ -s "$backup_file" ]] || fail "Database backup is empty."
printf 'Verifying backup with PostgreSQL 18 pg_restore...\n'
pg_restore --list "$backup_file" >/dev/null

printf 'Applying migrations...\n'
pnpm exec prisma migrate deploy
printf 'Generating Prisma Client...\n'
pnpm exec prisma generate

printf 'Building production application...\n'
pnpm run build

pm2 describe quiz-admin >/dev/null 2>&1 || fail "PM2 process quiz-admin does not exist; refusing to create a duplicate process."
printf 'Restarting quiz-admin...\n'
pm2 restart quiz-admin --update-env
pm2 save

printf 'Checking application health...\n'
healthy=false
for attempt in {1..12}; do
  if curl --fail --silent --show-error --max-time 5 "$health_url" >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
[[ "$healthy" == true ]] || fail "Application did not become healthy at $health_url."

printf '\nDeployment completed successfully. Backup: %s\n' "$backup_file"
