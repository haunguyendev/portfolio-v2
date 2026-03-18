import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MediaModule } from "../media/media.module";
import { AuthModule } from "../auth/auth.module";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";
import { ResumeResolver } from "./resume.resolver";
import { PuppeteerPdfService } from "./puppeteer-pdf.service";

@Module({
  imports: [PrismaModule, MediaModule, AuthModule],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeResolver, PuppeteerPdfService],
  exports: [ResumeService],
})
export class ResumeModule {}
