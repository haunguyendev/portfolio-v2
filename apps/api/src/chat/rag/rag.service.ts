import { Injectable, Logger } from "@nestjs/common";
import { EmbeddingService } from "./embedding.service";
import { VectorStoreService } from "./vector-store.service";
import { LlmProviderService } from "./llm-provider.service";
import { buildPrompt } from "./prompt-builder";
import type { ChatMessage } from "../dto/chat-types";

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private embeddingService: EmbeddingService,
    private vectorStore: VectorStoreService,
    private llmProvider: LlmProviderService,
  ) {}

  async *query(
    message: string,
    chatHistory: ChatMessage[] = [],
  ): AsyncGenerator<string> {
    // 1. Embed user question
    const queryVector = await this.embeddingService.embedQuery(message);

    // 2. Retrieve relevant chunks
    const chunks = await this.vectorStore.similaritySearch(queryVector, 5);
    this.logger.debug(
      `Retrieved ${chunks.length} chunks (top similarity: ${chunks[0]?.similarity?.toFixed(3) ?? "N/A"})`,
    );

    // 3. Build prompt with context
    const prompt = buildPrompt(chunks, chatHistory, message);

    // 4. Stream LLM response
    yield* this.llmProvider.stream(prompt);
  }
}
