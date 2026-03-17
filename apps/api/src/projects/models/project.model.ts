import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

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

  @Field()
  featured: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
