import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { ContentChunk, SearchResult } from "../dto/chat-types";

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(private prisma: PrismaService) {}

  async insertEmbedding(
    chunk: ContentChunk,
    vector: number[],
  ): Promise<void> {
    const vectorStr = `[${vector.join(",")}]`;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "Embedding" ("id", "content", "metadata", "sourceType", "sourceId", "embedding", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2::jsonb, $3, $4, $5::vector, NOW(), NOW())`,
      chunk.content,
      JSON.stringify(chunk.metadata),
      chunk.sourceType,
      chunk.sourceId,
      vectorStr,
    );
  }

  async similaritySearch(
    queryVector: number[],
    limit = 5,
    minSimilarity = 0.3,
  ): Promise<SearchResult[]> {
    const vectorStr = `[${queryVector.join(",")}]`;
    return this.prisma.$queryRawUnsafe<SearchResult[]>(
      `SELECT "id", "content", "metadata", "sourceType", "sourceId",
              1 - ("embedding" <=> $1::vector) AS "similarity"
       FROM "Embedding"
       WHERE 1 - ("embedding" <=> $1::vector) > $2
       ORDER BY "embedding" <=> $1::vector
       LIMIT $3`,
      vectorStr,
      minSimilarity,
      limit,
    );
  }

  async deleteBySourceType(sourceType: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM "Embedding" WHERE "sourceType" = $1`,
      sourceType,
    );
  }

  async deleteAll(): Promise<void> {
    await this.prisma.$executeRawUnsafe(`DELETE FROM "Embedding"`);
  }

  async count(): Promise<number> {
    const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM "Embedding"`,
    );
    return Number(result[0]?.count ?? 0);
  }
}
