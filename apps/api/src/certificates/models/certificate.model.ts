import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
export class Certificate {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  issuer: string;

  @Field()
  issueDate: Date;

  @Field({ nullable: true })
  credentialUrl?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  issuerIcon?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  published: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
