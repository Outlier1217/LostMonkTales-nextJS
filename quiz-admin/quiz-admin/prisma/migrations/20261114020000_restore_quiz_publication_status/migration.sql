UPDATE "quizzes"
SET "isPublished" = "isFeatured";

ALTER TABLE "quizzes"
ALTER COLUMN "isPublished" SET DEFAULT false;
