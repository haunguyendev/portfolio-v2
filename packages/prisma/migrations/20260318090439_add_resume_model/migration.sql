-- CreateEnum
CREATE TYPE "ResumeType" AS ENUM ('UPLOADED', 'GENERATED');

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "type" "ResumeType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);
