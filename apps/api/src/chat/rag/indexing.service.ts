import { Injectable, Logger } from "@nestjs/common";
import { ContentChunkerService } from "./content-chunker.service";
import { EmbeddingService } from "./embedding.service";
import { VectorStoreService } from "./vector-store.service";

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private chunker: ContentChunkerService,
    private embedding: EmbeddingService,
    private vectorStore: VectorStoreService,
  ) {}

  async reindexAll(): Promise<{ chunksIndexed: number }> {
    this.logger.log("Starting full re-index...");

    await this.vectorStore.deleteAll();
    const chunks = await this.chunker.chunkAll();

    // Batch embed 10 at a time to respect Gemini rate limits
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const vectors = await this.embedding.embedTexts(
        batch.map((c) => c.content),
      );

      for (let j = 0; j < batch.length; j++) {
        await this.vectorStore.insertEmbedding(batch[j], vectors[j]);
      }

      this.logger.log(
        `Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`,
      );
    }

    this.logger.log(`Re-index complete: ${chunks.length} chunks indexed`);
    return { chunksIndexed: chunks.length };
  }

  async reindexSource(
    sourceType: string,
  ): Promise<{ chunksIndexed: number }> {
    this.logger.log(`Re-indexing source: ${sourceType}`);
    await this.vectorStore.deleteBySourceType(sourceType);

    const allChunks = await this.chunker.chunkAll();
    const chunks = allChunks.filter((c) => c.sourceType === sourceType);

    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const vectors = await this.embedding.embedTexts(
        batch.map((c) => c.content),
      );
      for (let j = 0; j < batch.length; j++) {
        await this.vectorStore.insertEmbedding(batch[j], vectors[j]);
      }
    }

    return { chunksIndexed: chunks.length };
  }
}
