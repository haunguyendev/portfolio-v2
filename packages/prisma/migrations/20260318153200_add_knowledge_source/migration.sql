-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('SYSTEM', 'CUSTOM');

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSource_sourceKey_key" ON "KnowledgeSource"("sourceKey");

-- AlterTable
ALTER TABLE "Embedding" ADD COLUMN "knowledgeSourceId" TEXT;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Embedding_knowledgeSourceId_idx" ON "Embedding"("knowledgeSourceId");
