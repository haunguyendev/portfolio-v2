import { Module } from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { KnowledgeResolver } from "./knowledge.resolver";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [ChatModule],
  providers: [KnowledgeService, KnowledgeResolver],
})
export class KnowledgeModule {}
