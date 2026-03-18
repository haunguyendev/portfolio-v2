import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { IndexingService } from "./rag/indexing.service";
import { RestAuthGuard } from "./guards/rest-auth.guard";
import { CloudflareThrottlerGuard } from "./guards/chat-throttle.guard";

const ALLOWED_ROLES = new Set(["user", "assistant"]);

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
    // Validate input BEFORE entering SSE stream (returns proper HTTP errors)
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new BadRequestException("Messages array is required");
    }

    // Runtime validation: filter to valid roles, enforce string content
    const messages = body.messages
      .filter(
        (m) =>
          ALLOWED_ROLES.has(m.role) &&
          typeof m.content === "string" &&
          m.content.length > 0,
      )
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, 500),
      }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      throw new BadRequestException("Last message must be from user");
    }

    if (messages.length > 20) {
      throw new BadRequestException("Too many messages (max 20)");
    }

    // SSE headers for Vercel AI SDK Data Stream Protocol
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Vercel-AI-Data-Stream", "v1");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      for await (const token of this.chatService.chat(messages)) {
        res.write(`0:${JSON.stringify(token)}\n`);
      }

      res.write(
        `d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`,
      );
    } catch (error) {
      this.logger.error(`Chat error: ${(error as Error).message}`);
      res.write(
        `e:${JSON.stringify({ message: "Something went wrong. Please try again." })}\n`,
      );
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
