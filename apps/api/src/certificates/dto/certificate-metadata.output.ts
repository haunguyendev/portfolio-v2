import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class CertificateMetadata {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  issuer?: string;

  @Field({ nullable: true })
  issueDate?: string;

  @Field({ nullable: true })
  issuerIcon?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  error?: string;
}
