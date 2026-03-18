import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { ResumeService } from "./resume.service";
import { Resume } from "./models/resume.model";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Resolver(() => Resume)
export class ResumeResolver {
  constructor(private readonly resumeService: ResumeService) {}

  /** List all resumes (admin only) */
  @Query(() => [Resume])
  @UseGuards(JwtAuthGuard)
  resumes() {
    return this.resumeService.findAll();
  }

  /** Get active resume metadata (public) */
  @Query(() => Resume, { nullable: true })
  activeResume() {
    return this.resumeService.findActive();
  }

  /** Set a resume as active (admin only) */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Resume)
  setActiveResume(@Args("id", { type: () => ID }) id: string) {
    return this.resumeService.setActive(id);
  }

  /** Delete a resume (admin only) */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteResume(@Args("id", { type: () => ID }) id: string) {
    return this.resumeService.delete(id);
  }
}
