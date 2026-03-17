import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryInput, UpdateCategoryInput } from "./dto/category.input";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return categories.map((c) => ({ ...c, postCount: c._count.posts }));
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  async create(input: CreateCategoryInput) {
    return this.prisma.category.create({ data: input });
  }

  async update(id: string, input: UpdateCategoryInput) {
    return this.prisma.category.update({ where: { id }, data: input });
  }

  async delete(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return true;
  }
}
