import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ContentChunkerService } from "./content-chunker.service";
import { EmbeddingService } from "./embedding.service";
import { VectorStoreService } from "./vector-store.service";
import type { ContentChunk } from "../dto/chat-types";

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private prisma: PrismaService,
    private chunker: ContentChunkerService,
    private embedding: EmbeddingService,
    private vectorStore: VectorStoreService,
  ) {}

  async reindexAll(): Promise<{ chunksIndexed: number }> {
    this.logger.log("Starting full re-index...");

    await this.vectorStore.deleteAll();
    const chunks = await this.chunker.chunkAll();

    // Build sourceKey → knowledgeSourceId lookup
    const sources = await this.prisma.knowledgeSource.findMany({
      select: { id: true, sourceKey: true },
    });
    const sourceMap = new Map(sources.map((s) => [s.sourceKey, s.id]));

    await this.embedAndInsert(
      chunks,
      (chunk) => sourceMap.get(chunk.sourceType),
    );

    this.logger.log(`Re-index complete: ${chunks.length} chunks indexed`);
    return { chunksIndexed: chunks.length };
  }

  async reindexByKnowledgeSourceId(
    knowledgeSourceId: string,
  ): Promise<{ chunksIndexed: number }> {
    const source = await this.prisma.knowledgeSource.findUnique({
      where: { id: knowledgeSourceId },
    });
    if (!source) throw new NotFoundException("Knowledge source not found");

    this.logger.log(`Re-indexing source: ${source.name} (${source.sourceKey})`);
    await this.vectorStore.deleteByKnowledgeSourceId(knowledgeSourceId);

    let chunks: ContentChunk[];

    if (source.type === "CUSTOM") {
      // Split custom markdown content
      chunks = await this.chunkCustomContent(
        source.content ?? "",
        source.sourceKey,
        source.id,
        source.name,
      );
    } else {
      // System source: re-chunk only that source type
      const allChunks = await this.chunker.chunkAll();
      chunks = allChunks.filter((c) => c.sourceType === source.sourceKey);
    }

    await this.embedAndInsert(chunks, () => knowledgeSourceId);

    this.logger.log(
      `Re-index complete for ${source.name}: ${chunks.length} chunks`,
    );
    return { chunksIndexed: chunks.length };
  }

  /** Chunk custom markdown content using text splitter */
  private async chunkCustomContent(
    content: string,
    sourceKey: string,
    sourceId: string,
    name: string,
  ): Promise<ContentChunk[]> {
    if (!content.trim()) return [];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 50,
    });
    const splits = await splitter.splitText(content);

    return splits.map((text, i) => ({
      content: text,
      sourceType: sourceKey,
      sourceId: `${sourceId}-${i}`,
      metadata: { title: name, url: "" },
    }));
  }

  /** Batch embed and insert chunks (10 at a time for rate limits) */
  private async embedAndInsert(
    chunks: ContentChunk[],
    resolveSourceId: (chunk: ContentChunk) => string | undefined,
  ): Promise<void> {
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const vectors = await this.embedding.embedTexts(
        batch.map((c) => c.content),
      );

      for (let j = 0; j < batch.length; j++) {
        await this.vectorStore.insertEmbedding(
          batch[j],
          vectors[j],
          resolveSourceId(batch[j]),
        );
      }

      this.logger.log(
        `Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`,
      );
    }
  }
}
