import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTagInput } from "./dto/tag.input";

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return tags.map((t) => ({ ...t, postCount: t._count.posts }));
  }

  async findOne(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async create(input: CreateTagInput) {
    return this.prisma.tag.create({ data: input });
  }

  async delete(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return true;
  }
}
