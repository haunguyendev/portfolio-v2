import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Request, Response } from "express";
import { RestAuthGuard } from "../auth/rest-auth.guard";
import { ResumeService } from "./resume.service";
import { PuppeteerPdfService } from "./puppeteer-pdf.service";
import { buildCvHtml } from "./cv-template";
import type { CvData } from "./cv-data.interface";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_GENERATE_PAYLOAD = 100 * 1024; // 100KB

/** Sanitize filename for Content-Disposition header (prevent header injection) */
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

@Controller("resume")
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly puppeteerPdfService: PuppeteerPdfService,
  ) {}

  /** POST /api/resume/upload — Upload PDF (JWT protected) */
  @Post("upload")
  @UseGuards(RestAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (
        _req: unknown,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype === "application/pdf") {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Only PDF allowed.`,
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }
    return this.resumeService.upload(file);
  }

  /** GET /api/resume/download — Download active CV (public) */
  @Get("download")
  async download(@Req() req: Request, @Res() res: Response) {
    const { stream, fileName, fileSize } =
      await this.resumeService.download();

    // Check if preview mode (inline) or download (attachment)
    const disposition = req.query.preview === "true" ? "inline" : "attachment";

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": String(fileSize),
      "Content-Disposition": `${disposition}; filename="${sanitizeFileName(fileName)}"`,
      "Cache-Control": "public, max-age=3600",
    });

    stream.pipe(res);
  }

  /** POST /api/resume/generate — Generate CV from data (JWT protected) */
  @Post("generate")
  @UseGuards(RestAuthGuard)
  async generate(@Body() data: CvData) {
    // Validate payload size to prevent OOM
    const payloadSize = Buffer.byteLength(JSON.stringify(data));
    if (payloadSize > MAX_GENERATE_PAYLOAD) {
      throw new BadRequestException(
        `Payload too large: ${payloadSize}B. Max: ${MAX_GENERATE_PAYLOAD}B`,
      );
    }
    if (!data.name || !data.title) {
      throw new BadRequestException("name and title are required");
    }

    const html = buildCvHtml(data);
    const pdfBuffer = await this.puppeteerPdfService.generatePdf(html);
    const fileName = `generated-cv-${Date.now()}.pdf`;

    return this.resumeService.generate(pdfBuffer, fileName);
  }
}
