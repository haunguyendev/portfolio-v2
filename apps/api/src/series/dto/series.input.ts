import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateSeriesInput {
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field({ nullable: true })
  published?: boolean;
}

@InputType()
export class UpdateSeriesInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field({ nullable: true })
  published?: boolean;
}
