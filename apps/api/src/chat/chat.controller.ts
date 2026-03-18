import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  Logger,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { IndexingService } from "./rag/indexing.service";
import { RestAuthGuard } from "./guards/rest-auth.guard";
import { CloudflareThrottlerGuard } from "./guards/chat-throttle.guard";

@Controller("chat")
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private chatService: ChatService,
    private indexingService: IndexingService,
  ) {}

  @Post()
  @HttpCode(200)
  @UseGuards(CloudflareThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async chat(
    @Body() body: { messages: { role: string; content: string }[] },
    @Res() res: Response,
  ) {
    // SSE headers for Vercel AI SDK Data Stream Protocol
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Vercel-AI-Data-Stream", "v1");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      const messages = (body.messages ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      for await (const token of this.chatService.chat(messages)) {
        res.write(`0:${JSON.stringify(token)}\n`);
      }

      // Finish message
      res.write(
        `d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`,
      );
    } catch (error) {
      const message =
        (error as Error).message || "An error occurred";
      this.logger.error(`Chat error: ${message}`);
      res.write(`e:${JSON.stringify({ message })}\n`);
    } finally {
      res.end();
    }
  }

  @Post("reindex")
  @UseGuards(RestAuthGuard, CloudflareThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 3600000 } })
  async reindex() {
    const result = await this.indexingService.reindexAll();
    return result;
  }
}
