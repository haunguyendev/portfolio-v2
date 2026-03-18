import { ObjectType, Field, ID, Int, registerEnumType } from "@nestjs/graphql";

export enum ResumeType {
  UPLOADED = "UPLOADED",
  GENERATED = "GENERATED",
}

registerEnumType(ResumeType, {
  name: "ResumeType",
  description: "Type of resume: uploaded PDF or generated from data",
});

@ObjectType()
export class Resume {
  @Field(() => ID)
  id: string;

  @Field(() => ResumeType)
  type: ResumeType;

  @Field()
  fileName: string;

  @Field()
  filePath: string;

  @Field(() => Int)
  fileSize: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
