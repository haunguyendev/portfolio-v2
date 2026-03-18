import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { GraphqlModule } from "./graphql/graphql.module";
import { CategoriesModule } from "./categories/categories.module";
import { TagsModule } from "./tags/tags.module";
import { SeriesModule } from "./series/series.module";
import { PostsModule } from "./posts/posts.module";
import { ProjectsModule } from "./projects/projects.module";
import { MediaModule } from "./media/media.module";
import { CertificatesModule } from "./certificates/certificates.module";
import { ResumeModule } from "./resume/resume.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GraphqlModule,
    CategoriesModule,
    TagsModule,
    SeriesModule,
    PostsModule,
    ProjectsModule,
    MediaModule,
    CertificatesModule,
    ResumeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
