import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { Project } from "./models/project.model";
import { CreateProjectInput, UpdateProjectInput } from "./dto/project.input";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [Project])
  projects(@Args("featuredOnly", { nullable: true }) featuredOnly?: boolean) {
    return this.projectsService.findAll(featuredOnly);
  }

  @Query(() => Project, { nullable: true })
  project(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.findOne(id);
  }

  @Query(() => Project, { nullable: true })
  projectBySlug(@Args("slug") slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Project)
  createProject(@Args("input") input: CreateProjectInput) {
    return this.projectsService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Project)
  updateProject(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateProjectInput
  ) {
    return this.projectsService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => [Project])
  reorderProjects(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.projectsService.reorder(ids);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteProject(@Args("id", { type: () => ID }) id: string) {
    return this.projectsService.delete(id);
  }
}
