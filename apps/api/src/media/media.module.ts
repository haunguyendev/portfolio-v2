import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { MinioService } from "./minio.service";
import { ImageProcessingService } from "./image-processing.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MediaController],
  providers: [MediaService, MinioService, ImageProcessingService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
