CREATE TABLE "content_likes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_likes_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "content_comments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "content_comments_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "content_shares" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "result" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_shares_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "content_likes_userId_targetType_targetId_key" ON "content_likes"("userId", "targetType", "targetId");
CREATE INDEX "content_likes_targetType_targetId_idx" ON "content_likes"("targetType", "targetId");
CREATE INDEX "content_comments_targetType_targetId_createdAt_idx" ON "content_comments"("targetType", "targetId", "createdAt");
CREATE INDEX "content_comments_parentId_idx" ON "content_comments"("parentId");
CREATE INDEX "content_shares_targetType_targetId_createdAt_idx" ON "content_shares"("targetType", "targetId", "createdAt");
ALTER TABLE "content_likes" ADD CONSTRAINT "content_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_comments" ADD CONSTRAINT "content_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_comments" ADD CONSTRAINT "content_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "content_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_shares" ADD CONSTRAINT "content_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
