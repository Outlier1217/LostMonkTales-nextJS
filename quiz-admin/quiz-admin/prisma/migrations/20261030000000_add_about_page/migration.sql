CREATE TABLE "about_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'About Lost Monk Tales',
    "tagline" TEXT NOT NULL DEFAULT 'Beyond Belief. Toward Understanding.',
    "introduction" TEXT NOT NULL DEFAULT '',
    "whatWeDo" TEXT NOT NULL DEFAULT '',
    "quizzesCourses" TEXT NOT NULL DEFAULT '',
    "studioVision" TEXT NOT NULL DEFAULT '',
    "philosophy" TEXT NOT NULL DEFAULT '',
    "closing" TEXT NOT NULL DEFAULT '',
    "founderName" TEXT NOT NULL DEFAULT 'Ar. Sumit K. Pahil',
    "founderDesignation" TEXT NOT NULL DEFAULT 'Founder, Lost Monk Tales · Studio LM',
    "founderBio" TEXT NOT NULL DEFAULT '',
    "founderImage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "about_pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "about_people" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'TEAM',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "about_people_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "about_people_aboutPageId_kind_sortOrder_idx" ON "about_people"("aboutPageId", "kind", "sortOrder");
ALTER TABLE "about_people" ADD CONSTRAINT "about_people_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
