import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { KnowledgeSourceType } from "@prisma/client";
import type {
  CreateCustomSourceInput,
  UpdateCustomSourceInput,
} from "./dto/knowledge-source.input";

const SYSTEM_SOURCES = [
  { name: "Profile", sourceKey: "profile" },
  { name: "Skills", sourceKey: "skill" },
  { name: "Experience", sourceKey: "experience" },
  { name: "Projects", sourceKey: "project" },
  { name: "Certificates", sourceKey: "certificate" },
  { name: "Blog Posts", sourceKey: "blog" },
] as const;

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private prisma: PrismaService) {}

  /** Seed system sources on startup if they don't exist */
  async onModuleInit() {
    for (const src of SYSTEM_SOURCES) {
      await this.prisma.knowledgeSource.upsert({
        where: { sourceKey: src.sourceKey },
        update: {},
        create: {
          name: src.name,
          sourceKey: src.sourceKey,
          type: KnowledgeSourceType.SYSTEM,
        },
      });
    }
    this.logger.log(`Seeded ${SYSTEM_SOURCES.length} system knowledge sources`);
  }

  async findAll() {
    const sources = await this.prisma.knowledgeSource.findMany({
      include: { _count: { select: { embeddings: true } } },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    });

    // Get last indexed timestamps
    const lastIndexed = await this.prisma.embedding.groupBy({
      by: ["knowledgeSourceId"],
      _max: { createdAt: true },
      where: { knowledgeSourceId: { not: null } },
    });
    const indexMap = new Map(
      lastIndexed.map((r) => [r.knowledgeSourceId, r._max.createdAt]),
    );

    return sources.map((s) => ({
      ...s,
      chunkCount: s._count.embeddings,
      lastIndexedAt: indexMap.get(s.id) ?? null,
    }));
  }

  async toggle(id: string, enabled: boolean) {
    const source = await this.prisma.knowledgeSource.findUnique({
      where: { id },
    });
    if (!source) throw new NotFoundException("Knowledge source not found");

    return this.prisma.knowledgeSource.update({
      where: { id },
      data: { enabled },
    });
  }

  async createCustom(input: CreateCustomSourceInput) {
    const sourceKey = `custom-${Date.now()}`;
    return this.prisma.knowledgeSource.create({
      data: {
        name: input.name,
        content: input.content,
        sourceKey,
        type: KnowledgeSourceType.CUSTOM,
      },
    });
  }

  async updateCustom(id: string, input: UpdateCustomSourceInput) {
    const source = await this.prisma.knowledgeSource.findUnique({
      where: { id },
    });
    if (!source) throw new NotFoundException("Knowledge source not found");
    if (source.type !== KnowledgeSourceType.CUSTOM) {
      throw new BadRequestException("Cannot edit system sources");
    }

    return this.prisma.knowledgeSource.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.content !== undefined && { content: input.content }),
      },
    });
  }

  async deleteCustom(id: string) {
    const source = await this.prisma.knowledgeSource.findUnique({
      where: { id },
    });
    if (!source) throw new NotFoundException("Knowledge source not found");
    if (source.type !== KnowledgeSourceType.CUSTOM) {
      throw new BadRequestException("Cannot delete system sources");
    }

    // Delete related embeddings first, then source
    await this.prisma.embedding.deleteMany({
      where: { knowledgeSourceId: id },
    });
    await this.prisma.knowledgeSource.delete({ where: { id } });
    return true;
  }

  async getChunks(sourceId: string) {
    return this.prisma.embedding.findMany({
      where: { knowledgeSourceId: sourceId },
      select: {
        id: true,
        content: true,
        metadata: true,
        sourceType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }
}
