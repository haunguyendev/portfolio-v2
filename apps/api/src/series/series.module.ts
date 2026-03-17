import { Module } from "@nestjs/common";
import { SeriesService } from "./series.service";
import { SeriesResolver } from "./series.resolver";

@Module({
  providers: [SeriesService, SeriesResolver],
  exports: [SeriesService],
})
export class SeriesModule {}
