import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { PrismaService } from "../prisma/prisma.service";
import { MinioService } from "../media/minio.service";
import { ResumeType } from "./models/resume.model";

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  /** Upload a PDF file to MinIO and create a Resume record */
  async upload(file: Express.Multer.File) {
    // Validate MIME type
    if (file.mimetype !== "application/pdf") {
      throw new BadRequestException("Only PDF files are allowed");
    }

    // Generate UUID-based key
    const uuid = randomUUID();
    const key = `resume/${uuid}.pdf`;

    // Upload to MinIO
    await this.minio.upload(key, file.buffer, "application/pdf");

    // Create database record
    const resume = await this.prisma.resume.create({
      data: {
        type: ResumeType.UPLOADED,
        fileName: file.originalname,
        filePath: key,
        fileSize: file.buffer.length,
      },
    });

    this.logger.log(
      `Uploaded resume ${file.originalname} → ${key} (${file.buffer.length}B)`,
    );

    return resume;
  }

  /** Save a generated PDF buffer to MinIO and create a Resume record */
  async generate(pdfBuffer: Buffer, fileName: string) {
    const uuid = randomUUID();
    const key = `resume/${uuid}.pdf`;

    await this.minio.upload(key, pdfBuffer, "application/pdf");

    const resume = await this.prisma.resume.create({
      data: {
        type: ResumeType.GENERATED,
        fileName,
        filePath: key,
        fileSize: pdfBuffer.length,
      },
    });

    this.logger.log(
      `Generated resume ${fileName} → ${key} (${pdfBuffer.length}B)`,
    );

    return resume;
  }

  /** Download the active resume as a stream */
  async download(): Promise<{
    stream: Readable;
    fileName: string;
    fileSize: number;
  }> {
    const active = await this.prisma.resume.findFirst({
      where: { isActive: true },
    });

    if (!active) {
      throw new NotFoundException("No active resume found");
    }

    const { stream } = await this.minio.getObject(active.filePath);

    return {
      stream,
      fileName: active.fileName,
      fileSize: active.fileSize,
    };
  }

  /** List all resumes ordered by creation date */
  async findAll() {
    return this.prisma.resume.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /** Get the active resume metadata */
  async findActive() {
    return this.prisma.resume.findFirst({
      where: { isActive: true },
    });
  }

  /** Set a resume as active (deactivates all others in a transaction) */
  async setActive(id: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      throw new NotFoundException(`Resume ${id} not found`);
    }

    // Transaction: deactivate all, then activate target
    await this.prisma.$transaction([
      this.prisma.resume.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      this.prisma.resume.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);

    return this.prisma.resume.findUnique({ where: { id } });
  }

  /** Delete a resume from MinIO and database */
  async delete(id: string): Promise<boolean> {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      throw new NotFoundException(`Resume ${id} not found`);
    }

    if (resume.isActive) {
      throw new BadRequestException("Cannot delete the active resume");
    }

    // Delete from MinIO (ignore if already gone)
    await this.minio.deleteObject(resume.filePath).catch(() => {});

    // Delete database record
    await this.prisma.resume.delete({ where: { id } });

    this.logger.log(`Deleted resume ${id} (${resume.filePath})`);
    return true;
  }
}
