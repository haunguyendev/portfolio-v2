import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "embedding-001",
    });
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }
}
