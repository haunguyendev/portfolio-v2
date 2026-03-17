import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { Post } from "./models/post.model";
import { CreatePostInput, UpdatePostInput, PostsFilterInput } from "./dto/post.input";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, CurrentUserPayload } from "../auth/decorators/current-user.decorator";

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post])
  posts(@Args("filter", { nullable: true }) filter?: PostsFilterInput) {
    return this.postsService.findAll(filter);
  }

  @Query(() => Post, { nullable: true })
  post(@Args("id", { type: () => ID }) id: string) {
    return this.postsService.findOne(id);
  }

  @Query(() => Post, { nullable: true })
  postBySlug(@Args("slug") slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  createPost(
    @CurrentUser() user: CurrentUserPayload,
    @Args("input") input: CreatePostInput
  ) {
    return this.postsService.create(user.id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  updatePost(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdatePostInput
  ) {
    return this.postsService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  publishPost(@Args("id", { type: () => ID }) id: string) {
    return this.postsService.publish(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deletePost(@Args("id", { type: () => ID }) id: string) {
    return this.postsService.delete(id);
  }
}
