import { Injectable, BadRequestException } from "@nestjs/common";
import { RagService } from "./rag/rag.service";
import type { ChatMessage } from "./dto/chat-types";

@Injectable()
export class ChatService {
  constructor(private ragService: RagService) {}

  async *chat(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!messages?.length) {
      throw new BadRequestException("Messages array is required");
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      throw new BadRequestException("Last message must be from user");
    }

    if (lastMessage.content.length > 500) {
      throw new BadRequestException("Message too long (max 500 chars)");
    }

    if (messages.length > 20) {
      throw new BadRequestException("Too many messages (max 20)");
    }

    // Pass history (all except last) + current question
    const history = messages.slice(0, -1);
    yield* this.ragService.query(lastMessage.content, history);
  }
}
