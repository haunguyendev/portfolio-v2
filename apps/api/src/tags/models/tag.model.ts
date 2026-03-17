import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
export class Tag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => Int, { nullable: true })
  postCount?: number;
}
