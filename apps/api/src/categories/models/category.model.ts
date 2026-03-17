import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
export class Category {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field(() => Int, { nullable: true })
  postCount?: number;
}
