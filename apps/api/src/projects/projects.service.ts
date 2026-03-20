import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectInput, UpdateProjectInput } from "./dto/project.input";

/** Ensure URL has https:// prefix to prevent internal routing on frontend */
function normalizeUrl(url?: string): string | undefined {
  if (!url) return url;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeProjectUrls<T extends { github?: string; demo?: string }>(input: T): T {
  return { ...input, github: normalizeUrl(input.github), demo: normalizeUrl(input.demo) };
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(featuredOnly?: boolean) {
    return this.prisma.project.findMany({
      where: featuredOnly ? { featured: true } : undefined,
      orderBy: { sortOrder: "asc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findUnique({ where: { slug } });
  }

  async create(input: CreateProjectInput) {
    return this.prisma.project.create({ data: normalizeProjectUrls(input) });
  }

  async update(id: string, input: UpdateProjectInput) {
    return this.prisma.project.update({ where: { id }, data: normalizeProjectUrls(input) });
  }

  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, index) =>
        this.prisma.project.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
    return this.prisma.project.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async delete(id: string) {
    await this.prisma.project.delete({ where: { id } });
    return true;
  }
}
