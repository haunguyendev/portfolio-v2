import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { RagService } from "./rag/rag.service";
import { EmbeddingService } from "./rag/embedding.service";
import { VectorStoreService } from "./rag/vector-store.service";
import { LlmProviderService } from "./rag/llm-provider.service";
import { IndexingService } from "./rag/indexing.service";
import { ContentChunkerService } from "./rag/content-chunker.service";

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    RagService,
    EmbeddingService,
    VectorStoreService,
    LlmProviderService,
    IndexingService,
    ContentChunkerService,
  ],
})
export class ChatModule implements OnModuleInit {
  private readonly logger = new Logger(ChatModule.name);

  onModuleInit() {
    const required = ["GOOGLE_API_KEY", "GROQ_API_KEY"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
      this.logger.warn(
        `Missing env vars: ${missing.join(", ")}. Chat feature may not work.`,
      );
    }
  }
}
