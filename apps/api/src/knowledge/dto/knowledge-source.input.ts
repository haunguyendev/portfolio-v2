import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateCustomSourceInput {
  @Field() name: string;
  @Field() content: string;
}

@InputType()
export class UpdateCustomSourceInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) content?: string;
}
