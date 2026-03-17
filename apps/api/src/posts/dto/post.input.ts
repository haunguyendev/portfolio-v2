import { InputType, Field, Int } from "@nestjs/graphql";
import { GraphQLJSON } from "graphql-type-json";
import { PostType } from "../models/post.model";

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON)
  content: unknown;

  @Field({ nullable: true })
  coverImage?: string;

  @Field({ nullable: true })
  published?: boolean;

  @Field({ nullable: true })
  featured?: boolean;

  @Field(() => PostType, { nullable: true })
  type?: PostType;

  @Field(() => Int, { nullable: true })
  readingTime?: number;

  @Field({ nullable: true })
  mood?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  seriesId?: string;

  @Field(() => Int, { nullable: true })
  seriesOrder?: number;

  @Field(() => [String], { nullable: true })
  tagIds?: string[];

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDesc?: string;

  @Field({ nullable: true })
  ogImage?: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  content?: unknown;

  @Field({ nullable: true })
  coverImage?: string;

  @Field({ nullable: true })
  published?: boolean;

  @Field({ nullable: true })
  featured?: boolean;

  @Field(() => PostType, { nullable: true })
  type?: PostType;

  @Field(() => Int, { nullable: true })
  readingTime?: number;

  @Field({ nullable: true })
  mood?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  seriesId?: string;

  @Field(() => Int, { nullable: true })
  seriesOrder?: number;

  @Field(() => [String], { nullable: true })
  tagIds?: string[];

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDesc?: string;

  @Field({ nullable: true })
  ogImage?: string;
}

@InputType()
export class PostsFilterInput {
  @Field(() => PostType, { nullable: true })
  type?: PostType;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  seriesId?: string;

  @Field({ nullable: true })
  published?: boolean;

  @Field({ nullable: true })
  featured?: boolean;

  @Field(() => [String], { nullable: true })
  tagIds?: string[];
}
