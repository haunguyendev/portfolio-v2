import { ObjectType, Field, ID, Int, registerEnumType } from "@nestjs/graphql";
import { GraphQLJSON } from "graphql-type-json";
import { Category } from "../../categories/models/category.model";
import { Tag } from "../../tags/models/tag.model";
import { Series } from "../../series/models/series.model";

export enum PostType {
  BLOG = "BLOG",
  DIARY = "DIARY",
}

registerEnumType(PostType, { name: "PostType" });

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

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

  @Field()
  published: boolean;

  @Field()
  featured: boolean;

  @Field(() => PostType)
  type: PostType;

  @Field(() => Int, { nullable: true })
  readingTime?: number;

  @Field({ nullable: true })
  mood?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDesc?: string;

  @Field({ nullable: true })
  ogImage?: string;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field({ nullable: true })
  seriesId?: string;

  @Field(() => Series, { nullable: true })
  series?: Series;

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];
}
