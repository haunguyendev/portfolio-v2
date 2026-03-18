import { Injectable, Logger } from "@nestjs/common";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseMessage } from "@langchain/core/messages";

@Injectable()
export class LlmProviderService {
  private readonly logger = new Logger(LlmProviderService.name);
  private groq: ChatGroq | null = null;
  private gemini: ChatGoogleGenerativeAI | null = null;

  private getGroq(): ChatGroq {
    if (!this.groq) {
      this.groq = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        maxTokens: 1024,
        streaming: true,
      });
    }
    return this.groq;
  }

  private getGemini(): ChatGoogleGenerativeAI {
    if (!this.gemini) {
      this.gemini = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-2.0-flash",
        temperature: 0.7,
        maxOutputTokens: 1024,
        streaming: true,
      });
    }
    return this.gemini;
  }

  async *stream(messages: BaseMessage[]): AsyncGenerator<string> {
    try {
      const stream = await this.getGroq().stream(messages);
      for await (const chunk of stream) {
        if (chunk.content) yield chunk.content as string;
      }
    } catch (error) {
      this.logger.warn(
        `Groq failed, falling back to Gemini Flash: ${(error as Error).message}`,
      );
      try {
        const stream = await this.getGemini().stream(messages);
        for await (const chunk of stream) {
          if (chunk.content) yield chunk.content as string;
        }
      } catch (fallbackError) {
        this.logger.error(
          `Both LLMs failed: ${(fallbackError as Error).message}`,
        );
        throw new Error("AI service temporarily unavailable");
      }
    }
  }
}
