/*
  Warnings:

  - Made the column `folder` on table `Media` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "folder" SET NOT NULL;
