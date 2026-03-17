import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { TagsService } from "./tags.service";
import { Tag } from "./models/tag.model";
import { CreateTagInput } from "./dto/tag.input";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Resolver(() => Tag)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  @Query(() => [Tag])
  tags() {
    return this.tagsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Tag)
  createTag(@Args("input") input: CreateTagInput) {
    return this.tagsService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteTag(@Args("id", { type: () => ID }) id: string) {
    return this.tagsService.delete(id);
  }
}
