-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "name" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;
