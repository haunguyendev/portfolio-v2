import { InputType, Field, ID } from "@nestjs/graphql";

@InputType()
export class SetActiveResumeInput {
  @Field(() => ID)
  id: string;
}
