-- CreateTable
CREATE TABLE "art_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "art_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artworks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "contact" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "art_categories_name_key" ON "art_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "art_categories_slug_key" ON "art_categories"("slug");

-- CreateIndex
CREATE INDEX "artworks_categoryId_idx" ON "artworks"("categoryId");

-- AddForeignKey
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "art_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
