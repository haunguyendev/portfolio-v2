import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class CreateCategoryInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}
