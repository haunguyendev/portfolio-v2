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

  /** Stream GLM via direct ZhipuAI API (LangChain wrapper is broken) */
  private async *streamGlm(messages: BaseMessage[]): AsyncGenerator<string> {
    const apiKey = process.env.ZHIPUAI_API_KEY;
    if (!apiKey) throw new Error("ZHIPUAI_API_KEY not set");

    const body = {
      model: "glm-4-plus",
      messages: messages.map((m) => ({
        role: m.getType() === "human" ? "user" : m.getType() === "ai" ? "assistant" : "system",
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      })),
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    };

    const res = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GLM API error (${res.status}): ${err}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body from GLM");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data) as {
            choices: { delta: { content?: string } }[];
          };
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed SSE chunks
        }
      }
    }
  }

  /** Get available provider names */
  getAvailableProviders(): string[] {
    const list = ["groq"];
    if (process.env.ZHIPUAI_API_KEY) list.push("glm");
    list.push("gemini");
    return list;
  }

  /** Stream with optional provider selection, fallback on error */
  async *stream(
    messages: BaseMessage[],
    preferredProvider?: string,
  ): AsyncGenerator<string> {
    type Provider = { name: string; stream: () => AsyncGenerator<string> };

    const allProviders: Provider[] = [
      { name: "groq", stream: () => this.streamLangChain(this.getGroq(), messages) },
      ...(process.env.ZHIPUAI_API_KEY
        ? [{ name: "glm", stream: () => this.streamGlm(messages) }]
        : []),
      { name: "gemini", stream: () => this.streamLangChain(this.getGemini(), messages) },
    ];

    // If preferred provider specified, put it first
    let providers = allProviders;
    if (preferredProvider) {
      const preferred = allProviders.find((p) => p.name === preferredProvider);
      if (preferred) {
        providers = [
          preferred,
          ...allProviders.filter((p) => p.name !== preferredProvider),
        ];
      }
    }

    for (let i = 0; i < providers.length; i++) {
      const { name, stream } = providers[i];
      try {
        yield* stream();
        return;
      } catch (error) {
        const isLast = i === providers.length - 1;
        if (isLast) {
          this.logger.error(`All LLMs failed: ${(error as Error).message}`);
          throw new Error("AI service temporarily unavailable");
        }
        this.logger.warn(
          `${name} failed, trying ${providers[i + 1].name}: ${(error as Error).message}`,
        );
      }
    }
  }

  /** Helper: stream from LangChain-compatible model */
  private async *streamLangChain(
    model: ChatGroq | ChatGoogleGenerativeAI,
    messages: BaseMessage[],
  ): AsyncGenerator<string> {
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
      if (chunk.content) yield chunk.content as string;
    }
  }
}
