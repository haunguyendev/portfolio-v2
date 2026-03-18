import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class CreateCertificateInput {
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

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  published?: boolean;
}

@InputType()
export class UpdateCertificateInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  issuer?: string;

  @Field({ nullable: true })
  issueDate?: Date;

  @Field({ nullable: true })
  credentialUrl?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  issuerIcon?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  published?: boolean;
}
