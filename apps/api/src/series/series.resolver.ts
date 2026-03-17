import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { SeriesService } from "./series.service";
import { Series } from "./models/series.model";
import { CreateSeriesInput, UpdateSeriesInput } from "./dto/series.input";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Resolver(() => Series)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @Query(() => [Series])
  seriesList() {
    return this.seriesService.findAll();
  }

  @Query(() => Series, { nullable: true })
  seriesBySlug(@Args("slug") slug: string): Promise<any> {
    return this.seriesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Series)
  createSeries(@Args("input") input: CreateSeriesInput) {
    return this.seriesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Series)
  updateSeries(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateSeriesInput
  ) {
    return this.seriesService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteSeries(@Args("id", { type: () => ID }) id: string) {
    return this.seriesService.delete(id);
  }
}
