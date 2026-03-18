import { ObjectType, Field, Int, registerEnumType } from "@nestjs/graphql";
import { KnowledgeSourceType } from "@prisma/client";
import GraphQLJSON from "graphql-type-json";

registerEnumType(KnowledgeSourceType, { name: "KnowledgeSourceType" });

@ObjectType()
export class KnowledgeSourceModel {
  @Field() id: string;
  @Field() name: string;
  @Field(() => KnowledgeSourceType) type: KnowledgeSourceType;
  @Field() sourceKey: string;
  @Field() enabled: boolean;
  @Field({ nullable: true }) content?: string;
  @Field(() => GraphQLJSON, { nullable: true }) metadata?: Record<string, unknown>;
  @Field(() => Int) chunkCount: number;
  @Field({ nullable: true }) lastIndexedAt?: Date;
  @Field() updatedAt: Date;
}

@ObjectType()
export class EmbeddingChunkModel {
  @Field() id: string;
  @Field() content: string;
  @Field(() => GraphQLJSON, { nullable: true }) metadata?: Record<string, unknown>;
  @Field() sourceType: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class ReindexResult {
  @Field(() => Int) chunksIndexed: number;
}
