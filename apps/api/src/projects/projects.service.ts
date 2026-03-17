import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectInput, UpdateProjectInput } from "./dto/project.input";

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
    return this.prisma.project.create({ data: input });
  }

  async update(id: string, input: UpdateProjectInput) {
    return this.prisma.project.update({ where: { id }, data: input });
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
