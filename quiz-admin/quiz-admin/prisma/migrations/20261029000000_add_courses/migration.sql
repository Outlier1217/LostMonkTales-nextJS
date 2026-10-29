CREATE TYPE "CourseAccessType" AS ENUM ('FREE', 'PAID');
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "LessonType" AS ENUM ('TEXT', 'YOUTUBE', 'RESOURCE');
CREATE TYPE "ResourceAccess" AS ENUM ('PUBLIC', 'ENROLLED');
CREATE TYPE "EnrollmentSource" AS ENUM ('PURCHASE', 'ADMIN_GRANT');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'REFUNDED');

CREATE TABLE "courses" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "description" TEXT,
  "thumbnailUrl" TEXT,
  "category" TEXT,
  "subject" TEXT,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
  "instructor" TEXT,
  "learningOutcomes" JSONB,
  "prerequisites" JSONB,
  "language" TEXT NOT NULL DEFAULT 'English',
  "durationMinutes" INTEGER,
  "accessType" "CourseAccessType" NOT NULL DEFAULT 'FREE',
  "price" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "featuredOrder" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");
CREATE INDEX "courses_status_isFeatured_featuredOrder_idx" ON "courses"("status", "isFeatured", "featuredOrder");
CREATE INDEX "courses_category_idx" ON "courses"("category");

CREATE TABLE "course_sections" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "course_sections_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "course_sections_courseId_order_key" UNIQUE ("courseId", "order")
);
CREATE INDEX "course_sections_courseId_idx" ON "course_sections"("courseId");

CREATE TABLE "course_lessons" (
  "id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT,
  "content" TEXT,
  "type" "LessonType" NOT NULL DEFAULT 'TEXT',
  "youtubeUrl" TEXT,
  "isPreview" BOOLEAN NOT NULL DEFAULT false,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "durationMinutes" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "course_lessons_sectionId_slug_key" UNIQUE ("sectionId", "slug"),
  CONSTRAINT "course_lessons_sectionId_order_key" UNIQUE ("sectionId", "order")
);
CREATE INDEX "course_lessons_sectionId_idx" ON "course_lessons"("sectionId");

CREATE TABLE "course_resources" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "lessonId" TEXT,
  "originalName" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "extension" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "access" "ResourceAccess" NOT NULL DEFAULT 'ENROLLED',
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_resources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "course_resources_storageKey_key" ON "course_resources"("storageKey");
CREATE INDEX "course_resources_courseId_lessonId_idx" ON "course_resources"("courseId", "lessonId");

CREATE TABLE "course_enrollments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "source" "EnrollmentSource" NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "course_enrollments_userId_courseId_key" UNIQUE ("userId", "courseId")
);
CREATE INDEX "course_enrollments_courseId_idx" ON "course_enrollments"("courseId");

CREATE TABLE "course_orders" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT,
  "providerReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMP(3),
  CONSTRAINT "course_orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "course_orders_provider_providerReference_key" ON "course_orders"("provider", "providerReference");
CREATE INDEX "course_orders_userId_courseId_idx" ON "course_orders"("userId", "courseId");

CREATE TABLE "course_access_grants" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "grantedById" TEXT,
  "reason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_access_grants_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "course_access_grants_userId_courseId_idx" ON "course_access_grants"("userId", "courseId");

ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "course_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_orders" ADD CONSTRAINT "course_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_orders" ADD CONSTRAINT "course_orders_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_access_grants" ADD CONSTRAINT "course_access_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_access_grants" ADD CONSTRAINT "course_access_grants_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_access_grants" ADD CONSTRAINT "course_access_grants_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
