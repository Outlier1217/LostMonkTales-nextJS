ALTER TABLE "quizzes"
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

UPDATE "quizzes"
SET "isFeatured" = "isPublished";

UPDATE "quizzes"
SET "isPublished" = true
WHERE "isPublished" = false;

ALTER TABLE "quizzes"
ALTER COLUMN "isPublished" SET DEFAULT true;
