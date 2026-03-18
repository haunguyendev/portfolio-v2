import { Injectable, Logger } from "@nestjs/common";

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIMS = 768;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  private get apiKey(): string {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY not set");
    }
    return process.env.GOOGLE_API_KEY;
  }

  /** Call Google embedContent API with outputDimensionality support */
  private async callEmbedApi(
    texts: string[],
  ): Promise<number[][]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents?key=${this.apiKey}`;
    const body = {
      requests: texts.map((text) => ({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBED_DIMS,
      })),
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding API error (${res.status}): ${err}`);
    }

    const data = (await res.json()) as {
      embeddings: { values: number[] }[];
    };
    return data.embeddings.map((e) => e.values);
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return this.callEmbedApi(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.callEmbedApi([text]);
    return vector;
  }
}
