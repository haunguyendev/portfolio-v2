import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { KnowledgeService } from "./knowledge.service";
import { IndexingService } from "../chat/rag/indexing.service";
import {
  KnowledgeSourceModel,
  EmbeddingChunkModel,
  ReindexResult,
} from "./dto/knowledge-source.model";
import {
  CreateCustomSourceInput,
  UpdateCustomSourceInput,
} from "./dto/knowledge-source.input";

@Resolver(() => KnowledgeSourceModel)
export class KnowledgeResolver {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly indexingService: IndexingService,
  ) {}

  @Query(() => [KnowledgeSourceModel])
  knowledgeSources() {
    return this.knowledgeService.findAll();
  }

  @Query(() => [EmbeddingChunkModel])
  knowledgeSourceChunks(
    @Args("sourceId", { type: () => ID }) sourceId: string,
  ) {
    return this.knowledgeService.getChunks(sourceId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => KnowledgeSourceModel)
  toggleKnowledgeSource(
    @Args("id", { type: () => ID }) id: string,
    @Args("enabled") enabled: boolean,
  ) {
    return this.knowledgeService.toggle(id, enabled);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => KnowledgeSourceModel)
  createCustomKnowledgeSource(@Args("input") input: CreateCustomSourceInput) {
    return this.knowledgeService.createCustom(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => KnowledgeSourceModel)
  updateCustomKnowledgeSource(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateCustomSourceInput,
  ) {
    return this.knowledgeService.updateCustom(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteCustomKnowledgeSource(@Args("id", { type: () => ID }) id: string) {
    return this.knowledgeService.deleteCustom(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ReindexResult)
  async reindexKnowledgeSource(
    @Args("id", { type: () => ID }) id: string,
  ) {
    return this.indexingService.reindexByKnowledgeSourceId(id);
  }
}
