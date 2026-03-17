import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { Category } from "./models/category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./dto/category.input";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [Category])
  categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => Category, { nullable: true })
  category(@Args("id", { type: () => ID }) id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Category)
  createCategory(@Args("input") input: CreateCategoryInput) {
    return this.categoriesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Category)
  updateCategory(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateCategoryInput
  ) {
    return this.categoriesService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteCategory(@Args("id", { type: () => ID }) id: string) {
    return this.categoriesService.delete(id);
  }
}
