import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class Series {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field()
  published: boolean;

  @Field()
  createdAt: Date;
}
