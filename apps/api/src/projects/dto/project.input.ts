import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class CreateProjectInput {
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  longDesc?: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => [String])
  technologies: string[];

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  github?: string;

  @Field({ nullable: true })
  demo?: string;

  @Field({ nullable: true })
  featured?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  teamSize?: string;

  @Field({ nullable: true })
  impact?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}

@InputType()
export class UpdateProjectInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  longDesc?: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => [String], { nullable: true })
  technologies?: string[];

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  github?: string;

  @Field({ nullable: true })
  demo?: string;

  @Field({ nullable: true })
  featured?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  teamSize?: string;

  @Field({ nullable: true })
  impact?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}
